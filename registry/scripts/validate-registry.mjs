import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const registryRoot = resolve(__dirname, '..');

const files = [
  'registry.json',
  'r/meda-shell.json',
  'r/meda-shell-state.json',
  'r/meda-workbench-layout.json',
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const parsedFiles = new Map();

for (const file of files) {
  const absolutePath = resolve(registryRoot, file);
  const raw = await readFile(absolutePath, 'utf8');
  parsedFiles.set(file, JSON.parse(raw));
}

const registry = parsedFiles.get('registry.json');

assert(registry?.name === '@meda', 'registry.json must declare the @meda namespace.');
assert(Array.isArray(registry?.items), 'registry.json must include an items array.');

for (const [file, json] of parsedFiles.entries()) {
  if (file === 'registry.json') continue;

  assert(typeof json?.name === 'string' && json.name.length > 0, `${file} must include a name.`);
  assert(
    typeof json?.type === 'string' && json.type.startsWith('registry:'),
    `${file} must include a registry type.`
  );
  assert(Array.isArray(json?.dependencies), `${file} must declare dependencies.`);
  assert(
    Array.isArray(json?.files) && json.files.length > 0,
    `${file} must include at least one file entry.`
  );

  for (const itemFile of json.files) {
    assert(
      typeof itemFile?.path === 'string' && itemFile.path.length > 0,
      `${file} has a file entry without a path.`
    );
    assert(
      typeof itemFile?.target === 'string' && itemFile.target.length > 0,
      `${file} has a file entry without a target.`
    );
    assert(
      typeof itemFile?.type === 'string' && itemFile.type.startsWith('registry:'),
      `${file} has a file entry with an invalid type.`
    );
    assert(
      typeof itemFile?.content === 'string' && itemFile.content.trim().length > 0,
      `${file} has a file entry without inline content.`
    );
  }
}

process.stdout.write(`Validated ${files.length} Meda registry JSON files.\n`);
