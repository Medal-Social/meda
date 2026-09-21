#!/usr/bin/env node
/**
 * detect-stale-changesets.mjs
 *
 * Finds changeset files that a release on `prod` has already CONSUMED but
 * which are still sitting on `dev`, where the next release would consume them
 * a second time.
 *
 * Why this can happen at all
 * --------------------------
 * In the normal `feat → dev → prod` flow a changeset reaches `prod` THROUGH
 * `dev`, so the commit that added it is in the common ancestry. When
 * `changeset version` deletes it on `prod`, the auto-sync merge sees
 * base=present / prod=absent / dev=present and propagates the delete. Nothing
 * to detect.
 *
 * But when a release is cut by cherry-picking onto `prod` (as 2.8.0 was, via
 * #220), the add on `prod` is INDEPENDENT of the add on `dev`. At the merge
 * base the file does not exist, so the merge sees base=absent / prod=absent /
 * dev=present, calls it "added by them", and silently KEEPS dev's copy. There
 * is no conflict and no warning — the next `changeset version` re-emits the
 * already-published release notes and mis-bumps the version (2.9.0 instead of
 * 2.8.1, in the case this script was written for).
 *
 * Precision
 * ---------
 * A changeset is reported ONLY when it was deleted by a `chore: release`
 * commit on `prod` within `merge-base(prod, dev)..prod`. That deliberately
 * excludes the common case of a changeset that simply has not been released
 * yet — dev's pending changesets were never deleted by a release commit, so
 * they can never be flagged. Once `prod` is an ancestor of `dev` again the
 * commit range is empty and the check is a guaranteed no-op.
 *
 * Usage:
 *   node scripts/detect-stale-changesets.mjs [--prod <ref>] [--dev <ref>]
 *
 * Prints a Markdown report to stdout (empty when nothing is stale) and, when
 * running under Actions, sets the `stale` output. Always exits 0 — reporting
 * and failing the job is the caller's decision.
 */

import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

/** The commit subject `changesets/action` uses (see release.yml `commit:`). */
const RELEASE_COMMIT_SUBJECT = /^chore:\s*release\b/i;

/** `.changeset/*.md`, excluding the directory's own README. */
const CHANGESET_PATH = /^\.changeset\/(?!README\.md$)[^/]+\.md$/;

/** Is this commit subject one of the changesets release commits? */
export function isReleaseCommit(subject) {
  return RELEASE_COMMIT_SUBJECT.test(String(subject ?? '').trim());
}

/** Keep only real changeset files from a list of paths. */
export function changesetPaths(paths) {
  return (paths ?? []).map((p) => String(p).trim()).filter((p) => CHANGESET_PATH.test(p));
}

/**
 * The core rule, kept pure so it can be unit-tested without a git repo.
 *
 * @param {object} input
 * @param {{ sha: string, subject: string, deleted: string[] }[]} input.releaseCommits
 *   Release commits on `prod` since the merge base, newest first, each with
 *   the changeset paths it deleted.
 * @param {string[]} input.devChangesets Changeset paths present on `dev`.
 * @returns {{ path: string, releasedIn: string, subject: string }[]}
 */
export function findStaleChangesets({ releaseCommits = [], devChangesets = [] } = {}) {
  const onDev = new Set(changesetPaths(devChangesets));
  const stale = [];
  const seen = new Set();

  for (const commit of releaseCommits) {
    if (!isReleaseCommit(commit?.subject)) continue;
    for (const path of changesetPaths(commit.deleted)) {
      if (!onDev.has(path) || seen.has(path)) continue;
      seen.add(path);
      stale.push({ path, releasedIn: commit.sha, subject: String(commit.subject).trim() });
    }
  }

  return stale;
}

/** Render the report the workflow puts in the step summary and the issue. */
export function renderReport(stale) {
  if (stale.length === 0) return '';
  const rows = stale
    .map((s) => `- \`${s.path}\` — consumed by ${s.releasedIn.slice(0, 8)} (\`${s.subject}\`)`)
    .join('\n');
  return [
    '### Released changesets still present on `dev`',
    '',
    'These were already consumed by a release on `prod`, so their notes have shipped.',
    'Left on `dev` the next `changeset version` consumes them again — republishing the',
    'same notes and over-bumping the version.',
    '',
    rows,
    '',
    'Fix: delete the listed files on `dev` (they are spent) and confirm with',
    '`pnpm exec changeset status --verbose` that the next bump is what you expect.',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function parseArgs(argv) {
  const args = { prod: 'HEAD', dev: 'origin/dev' };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--prod') args.prod = argv[++i];
    else if (argv[i] === '--dev') args.dev = argv[++i];
  }
  return args;
}

function main() {
  const { prod, dev } = parseArgs(process.argv.slice(2));

  const base = git(['merge-base', prod, dev]);
  const log = git(['log', '--format=%H%x00%s', `${base}..${prod}`]);

  const releaseCommits = log
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [sha, subject] = line.split('\0');
      return { sha, subject };
    })
    .filter((c) => isReleaseCommit(c.subject))
    .map((c) => ({
      ...c,
      // Single-parent diff. A merge commit yields nothing here, which is the
      // safe direction: changesets never releases from a merge commit.
      deleted: git([
        'diff-tree',
        '--no-commit-id',
        '-r',
        '--name-only',
        '--diff-filter=D',
        c.sha,
        '--',
        '.changeset',
      ])
        .split('\n')
        .filter(Boolean),
    }));

  const devChangesets = git(['ls-tree', '-r', '--name-only', dev, '--', '.changeset'])
    .split('\n')
    .filter(Boolean);

  const stale = findStaleChangesets({ releaseCommits, devChangesets });
  const report = renderReport(stale);

  if (report) process.stdout.write(`${report}\n`);

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `stale=${stale.length > 0}\n`);
    appendFileSync(process.env.GITHUB_OUTPUT, `stale_count=${stale.length}\n`);
  }
}

// Only run as a CLI, so the unit test can import the pure helpers.
if (process.argv[1]?.endsWith('detect-stale-changesets.mjs')) {
  main();
}
