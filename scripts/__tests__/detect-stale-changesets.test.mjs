import { describe, expect, it } from 'vitest';
import {
  changesetPaths,
  findStaleChangesets,
  isReleaseCommit,
  renderReport,
} from '../detect-stale-changesets.mjs';

const RELEASE = 'chore: release @medalsocial/meda';

describe('isReleaseCommit', () => {
  it('matches the subject changesets/action commits with', () => {
    expect(isReleaseCommit(RELEASE)).toBe(true);
    expect(isReleaseCommit('  chore: release @medalsocial/meda  ')).toBe(true);
    expect(isReleaseCommit('chore:release @medalsocial/meda')).toBe(true);
  });

  it('does not match ordinary commits that merely mention a release', () => {
    expect(isReleaseCommit('feat(shell): rail header layout')).toBe(false);
    expect(isReleaseCommit('docs: describe the release flow')).toBe(false);
    expect(isReleaseCommit('chore: prepare for release')).toBe(false);
    expect(isReleaseCommit('')).toBe(false);
    expect(isReleaseCommit(undefined)).toBe(false);
  });
});

describe('changesetPaths', () => {
  it('keeps changeset markdown only', () => {
    expect(
      changesetPaths([
        '.changeset/quiet-pugs-sin.md',
        '.changeset/config.json',
        '.changeset/README.md',
        '.changeset/nested/deep.md',
        'src/shell/shell-header.tsx',
        '',
      ])
    ).toEqual(['.changeset/quiet-pugs-sin.md']);
  });

  it('tolerates a missing list', () => {
    expect(changesetPaths(undefined)).toEqual([]);
  });
});

describe('findStaleChangesets', () => {
  it('flags a changeset consumed on prod that still exists on dev', () => {
    const stale = findStaleChangesets({
      releaseCommits: [
        { sha: 'f2a90904deadbeef', subject: RELEASE, deleted: ['.changeset/shell-rail.md'] },
      ],
      devChangesets: ['.changeset/shell-rail.md', '.changeset/deps-sweep.md'],
    });

    expect(stale).toEqual([
      { path: '.changeset/shell-rail.md', releasedIn: 'f2a90904deadbeef', subject: RELEASE },
    ]);
  });

  it('does NOT flag a changeset that is merely unreleased (the common case)', () => {
    // dev's pending changesets were never deleted by a release commit.
    const stale = findStaleChangesets({
      releaseCommits: [
        { sha: 'f2a90904', subject: RELEASE, deleted: ['.changeset/shell-rail.md'] },
      ],
      devChangesets: ['.changeset/deps-sweep.md', '.changeset/drop-fast-glob.md'],
    });

    expect(stale).toEqual([]);
  });

  it('does NOT flag the normal dev → prod flow, where the delete propagated', () => {
    const stale = findStaleChangesets({
      releaseCommits: [
        { sha: 'abc1234', subject: RELEASE, deleted: ['.changeset/already-synced.md'] },
      ],
      devChangesets: [],
    });

    expect(stale).toEqual([]);
  });

  it('ignores deletions made by commits that are not releases', () => {
    const stale = findStaleChangesets({
      releaseCommits: [
        {
          sha: 'deadbee',
          subject: 'chore: drop a changeset we no longer want',
          deleted: ['.changeset/shell-rail.md'],
        },
      ],
      devChangesets: ['.changeset/shell-rail.md'],
    });

    expect(stale).toEqual([]);
  });

  it('ignores non-changeset deletions inside the release commit', () => {
    const stale = findStaleChangesets({
      releaseCommits: [
        {
          sha: 'abc1234',
          subject: RELEASE,
          deleted: ['.changeset/config.json', '.changeset/README.md', 'CHANGELOG.md'],
        },
      ],
      devChangesets: ['.changeset/config.json', '.changeset/README.md', 'CHANGELOG.md'],
    });

    expect(stale).toEqual([]);
  });

  it('reports a path once even when several release commits deleted it', () => {
    const stale = findStaleChangesets({
      releaseCommits: [
        { sha: 'newer', subject: RELEASE, deleted: ['.changeset/shell-rail.md'] },
        { sha: 'older', subject: RELEASE, deleted: ['.changeset/shell-rail.md'] },
      ],
      devChangesets: ['.changeset/shell-rail.md'],
    });

    expect(stale).toHaveLength(1);
    expect(stale[0].releasedIn).toBe('newer');
  });

  it('is a no-op when prod is already an ancestor of dev (empty commit range)', () => {
    expect(findStaleChangesets({ releaseCommits: [], devChangesets: ['.changeset/a.md'] })).toEqual(
      []
    );
    expect(findStaleChangesets()).toEqual([]);
  });
});

describe('renderReport', () => {
  it('renders nothing when nothing is stale', () => {
    expect(renderReport([])).toBe('');
  });

  it('names every stale file and the release that consumed it', () => {
    const report = renderReport([
      { path: '.changeset/shell-rail.md', releasedIn: 'f2a90904deadbeef', subject: RELEASE },
    ]);

    expect(report).toContain('.changeset/shell-rail.md');
    expect(report).toContain('f2a90904');
    expect(report).toContain('changeset status');
  });
});
