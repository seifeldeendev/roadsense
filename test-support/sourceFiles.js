// Lists and reads source files for tests that check the shape of a layer,
// which import rules cannot see (file extensions, what a file contains).
const { readdirSync, readFileSync } = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Every file under `dir` (relative to the repo root), as repo-relative paths with forward slashes.
function sourceFiles(dir) {
  return readdirSync(path.join(ROOT, dir), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(ROOT, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'));
}

function readSource(file) {
  return readFileSync(path.join(ROOT, file), 'utf8');
}

module.exports = { sourceFiles, readSource };
