// The seed version the build script derives from the current export and schema.
const { readFileSync } = require('fs');
const path = require('path');
const { radarSeedVersion } = require('../scripts/radarSchema.cjs');

function currentRadarSeedVersion() {
  return radarSeedVersion(readFileSync(path.join(__dirname, '..', 'assets', 'data', 'radars_eg.json')));
}

module.exports = { currentRadarSeedVersion };
