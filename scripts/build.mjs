import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(currentDirectory, '..');
const sourceStyles = resolve(packageRoot, 'src/styles');
const distStyles = resolve(packageRoot, 'dist/styles');

await rm(distStyles, { recursive: true, force: true });
await mkdir(distStyles, { recursive: true });
await cp(sourceStyles, distStyles, { recursive: true });
