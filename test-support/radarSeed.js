// The seed version the build script derives from the current JSON export.
const { createHash } = require('crypto');
const { readFileSync } = require('fs');
const path = require('path');

function currentRadarSeedVersion() {
  const raw = readFileSync(path.join(__dirname, '..', 'assets', 'data', 'radars_eg.json'));
  return createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

module.exports = { currentRadarSeedVersion };
