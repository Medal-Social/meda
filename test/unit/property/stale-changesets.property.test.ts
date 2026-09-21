import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { changesetPaths, findStaleChangesets } from '../../../scripts/detect-stale-changesets.mjs';

/**
 * `findStaleChangesets` decides whether the prod → dev sync is allowed to run.
 * A false negative republishes release notes that already shipped and
 * mis-bumps the version; a false positive blocks every sync and opens a
 * tracking issue nobody can action. Both failure modes are silent at the point
 * they are created, which is what makes this worth generating inputs for
 * rather than only enumerating the cases someone thought of.
 */

const changesetName = fc.constantFrom(
  '.changeset/shell-rail.md',
  '.changeset/deps-sweep.md',
  '.changeset/quiet-pugs-sin.md',
  '.changeset/drop-fast-glob.md',
  '.changeset/security-refresh.md'
);

const nonChangeset = fc.constantFrom(
  '.changeset/config.json',
  '.changeset/README.md',
  '.changeset/nested/deep.md',
  'CHANGELOG.md',
  'package.json',
  'src/shell/shell-header.tsx',
  ''
);

const anyPath = fc.oneof(changesetName, nonChangeset);

const releaseSubject = fc.constantFrom(
  'chore: release @medalsocial/meda',
  'chore: version @medalsocial/meda'
);

const nonReleaseSubject = fc.constantFrom(
  'feat(shell): rail header layout',
  'chore: prepare for release',
  'docs: describe the release flow',
  'fix: drop a changeset we no longer want'
);

const commit = fc.record({
  sha: fc.string({ unit: fc.constantFrom(...'0123456789abcdef'), minLength: 7, maxLength: 40 }),
  subject: fc.oneof(releaseSubject, nonReleaseSubject),
  deleted: fc.array(anyPath, { maxLength: 5 }),
});

const input = fc.record({
  releaseCommits: fc.array(commit, { maxLength: 6 }),
  devChangesets: fc.array(anyPath, { maxLength: 6 }),
});

describe('findStaleChangesets (property)', () => {
  it('never reports a file that is not actually on dev', () => {
    // A report names files the operator is told to `git rm` from dev. Naming
    // one that is not there sends them chasing a file that does not exist.
    fc.assert(
      fc.property(input, (i) => {
        const onDev = new Set(i.devChangesets);
        for (const s of findStaleChangesets(i)) {
          expect(onDev.has(s.path)).toBe(true);
        }
      })
    );
  });

  it('only ever reports real changeset files', () => {
    fc.assert(
      fc.property(input, (i) => {
        for (const s of findStaleChangesets(i)) {
          expect(changesetPaths([s.path])).toEqual([s.path]);
        }
      })
    );
  });

  it('reports each path at most once, however many releases deleted it', () => {
    fc.assert(
      fc.property(input, (i) => {
        const paths = findStaleChangesets(i).map((s) => s.path);
        expect(new Set(paths).size).toBe(paths.length);
      })
    );
  });

  it('attributes every report to a commit that is genuinely a release', () => {
    fc.assert(
      fc.property(input, (i) => {
        const releases = new Set(
          i.releaseCommits
            .filter((c) => /^chore:\s*(release|version)\b/i.test(c.subject))
            .map((c) => c.sha)
        );
        for (const s of findStaleChangesets(i)) {
          expect(releases.has(s.releasedIn)).toBe(true);
        }
      })
    );
  });

  it('reports nothing when no release commit is in range', () => {
    // This is the steady state: once prod is contained in dev the commit range
    // is empty and the detector must be a guaranteed no-op, or every sync
    // stalls behind a tracking issue.
    fc.assert(
      fc.property(fc.array(anyPath, { maxLength: 6 }), (devChangesets) => {
        expect(findStaleChangesets({ releaseCommits: [], devChangesets })).toEqual([]);
      })
    );
  });

  it('reports nothing when dev holds no changesets at all', () => {
    fc.assert(
      fc.property(fc.array(commit, { maxLength: 6 }), (releaseCommits) => {
        expect(findStaleChangesets({ releaseCommits, devChangesets: [] })).toEqual([]);
      })
    );
  });

  it('is unaffected by commits that are not releases', () => {
    // A `fix:` commit deleting a changeset is a human dropping work they no
    // longer want, not a release consuming it — flagging it would block the
    // sync for a deliberate act.
    fc.assert(
      fc.property(input, fc.array(anyPath, { maxLength: 4 }), (i, extraDeletes) => {
        const withNoise = {
          ...i,
          releaseCommits: [
            ...i.releaseCommits,
            {
              sha: 'n0ise00',
              subject: 'fix: drop a changeset we no longer want',
              deleted: extraDeletes,
            },
          ],
        };
        expect(findStaleChangesets(withNoise)).toEqual(findStaleChangesets(i));
      })
    );
  });
});
