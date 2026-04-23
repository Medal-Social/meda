#!/usr/bin/env node
/**
 * Copies the shadcn registry files into the Vite demo build output so a single
 * Cloudflare Worker (configured in wrangler.toml) can serve both:
 *
 *   /                     → demo playground (from demo/dist/index.html)
 *   /registry.json        → registry index
 *   /r/<item>.json        → registry items
 *
 * Called from `pnpm worker:build` after `pnpm demo:build`.
 */
import { cp, mkdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(currentDirectory, '..');
const demoDist = resolve(packageRoot, 'demo/dist');
const registrySource = resolve(packageRoot, 'registry');

// Confirm demo has been built.
try {
  await stat(resolve(demoDist, 'index.html'));
} catch {
  throw new Error(
    `demo/dist/index.html not found. Run "pnpm demo:build" first (or use "pnpm worker:build").`
  );
}

await mkdir(resolve(demoDist, 'r'), { recursive: true });
await cp(resolve(registrySource, 'r'), resolve(demoDist, 'r'), { recursive: true });
await cp(resolve(registrySource, 'registry.json'), resolve(demoDist, 'registry.json'));

process.stdout.write('Copied registry.json and r/*.json into demo/dist\n');
