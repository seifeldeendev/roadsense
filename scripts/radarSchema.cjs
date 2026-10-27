// The bundled radar database's schema and seed version, shared by the build
// script and the tests so both derive the version the same way.
const { createHash } = require('crypto');

// Bump when rows are built differently without the SQL below changing.
const RADAR_SCHEMA_VERSION = 2;

const RADAR_SCHEMA_SQL = `
  CREATE TABLE meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
  CREATE TABLE cameras (
    id TEXT PRIMARY KEY NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    speed_limit_kmh INTEGER NOT NULL,
    road_name TEXT NOT NULL,
    type TEXT NOT NULL
  );
  CREATE INDEX cameras_lat_lng ON cameras (lat, lng);
`;

// Covers the data, the schema SQL and the schema version, so installed copies
// are replaced when any of them changes, not only when the export does.
function radarSeedVersion(rawExport) {
  return createHash('sha256')
    .update(`schema ${RADAR_SCHEMA_VERSION}\n${RADAR_SCHEMA_SQL}\n`)
    .update(rawExport)
    .digest('hex')
    .slice(0, 16);
}

module.exports = { RADAR_SCHEMA_SQL, RADAR_SCHEMA_VERSION, radarSeedVersion };
