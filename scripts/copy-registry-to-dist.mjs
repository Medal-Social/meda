#!/usr/bin/env node
/**
 * Copies built artifacts into the Vite demo build output so a single
 * Cloudflare Worker (configured in wrangler.toml) can serve:
 *
 *   /                     → demo playground (from demo/dist/index.html)
 *   /registry.json        → registry index
 *   /r/<item>.json        → registry items
 *   /storybook/           → Storybook docs
 *
 * Called from `pnpm worker:build` after `pnpm demo:build` and `pnpm storybook:build`.
 * Pass `--skip-storybook` for local worker dev builds that only need the demo + registry.
 */
import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(currentDirectory, '..');
const demoDist = resolve(packageRoot, 'demo/dist');
const registrySource = resolve(packageRoot, 'registry');
const storybookStatic = resolve(packageRoot, 'storybook-static');
const skipStorybook = process.argv.includes('--skip-storybook');

// Confirm demo has been built.
try {
  await stat(resolve(demoDist, 'index.html'));
} catch {
  throw new Error(
    `demo/dist/index.html not found. Run "pnpm demo:build" first (or use "pnpm worker:build").`
  );
}

if (!skipStorybook) {
  try {
    await stat(resolve(storybookStatic, 'index.html'));
  } catch {
    throw new Error(
      `storybook-static/index.html not found. Run "pnpm storybook:build" first (or use "pnpm worker:build").`
    );
  }
}

await mkdir(resolve(demoDist, 'r'), { recursive: true });
await cp(resolve(registrySource, 'r'), resolve(demoDist, 'r'), { recursive: true });
await cp(resolve(registrySource, 'registry.json'), resolve(demoDist, 'registry.json'));

if (!skipStorybook) {
  await rm(resolve(demoDist, 'storybook'), { recursive: true, force: true });
  await cp(storybookStatic, resolve(demoDist, 'storybook'), { recursive: true });
}

process.stdout.write(
  skipStorybook
    ? 'Copied registry.json and r/*.json into demo/dist\n'
    : 'Copied registry.json, r/*.json, and storybook-static into demo/dist\n'
);
