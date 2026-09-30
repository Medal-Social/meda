import { describe, expect, it } from 'vitest';

// Node runtime APIs without pulling in @types/node (see styles/theme.test.ts).
declare const require: (id: string) => unknown;
declare const __dirname: string;

const fs = require('node:fs') as {
  readFileSync(p: string, enc: string): string;
  readdirSync(p: string, opts: { recursive: true }): string[];
};
const path = require('node:path') as { join(...parts: string[]): string };

const root = path.join(__dirname, '../../..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) as {
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  peerDependenciesMeta: Record<string, { optional?: boolean }>;
};

const FEATURE_PEERS = [
  '@dnd-kit/core',
  '@dnd-kit/sortable',
  '@dnd-kit/utilities',
  '@xyflow/react',
  '@react-three/fiber',
  'three',
];

describe('package peer contract', () => {
  it.each(FEATURE_PEERS)('%s is an optional peer, not a hard dependency', (name) => {
    expect(pkg.peerDependencies[name]).toBeDefined();
    expect(pkg.peerDependenciesMeta[name]?.optional).toBe(true);
    expect(pkg.dependencies[name]).toBeUndefined();
  });

  it('does not ship font packages as runtime dependencies', () => {
    expect(Object.keys(pkg.dependencies).filter((d) => d.startsWith('@fontsource'))).toEqual([]);
  });

  // The lean entries are only lean if they never reach an optional peer.
  it.each(['calendar', 'primitives'])('src/%s never imports an optional feature peer', (dir) => {
    const base = path.join(root, 'src', dir);
    const files = fs
      .readdirSync(base, { recursive: true })
      .filter((f) => /\.tsx?$/.test(f) && !/stories|markdown-view/.test(f));
    const offenders = files.filter((f) => {
      const source = fs.readFileSync(path.join(base, f), 'utf8');
      return FEATURE_PEERS.some((peer) => source.includes(`'${peer}`));
    });
    expect(offenders).toEqual([]);
  });
});
