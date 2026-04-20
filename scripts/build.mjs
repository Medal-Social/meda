import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(currentDirectory, '..');
const sourceStyles = resolve(packageRoot, 'src/styles/globals.css');
const distDirectory = resolve(packageRoot, 'dist');
const distStyles = resolve(distDirectory, 'styles.css');

await mkdir(distDirectory, { recursive: true });
await rm(distStyles, { force: true });
await cp(sourceStyles, distStyles);
