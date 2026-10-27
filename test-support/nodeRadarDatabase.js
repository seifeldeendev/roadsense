// Jest has no native expo-sqlite, so tests read the same bundled radar database
// through Node's built-in SQLite. Only the open step differs from the app.
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, '..', 'assets', 'data', 'radars_eg.db');

async function openRadarDatabase() {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  return {
    getAllAsync: async (sql) => db.prepare(sql).all(),
    getFirstAsync: async (sql) => db.prepare(sql).get() ?? null,
  };
}

module.exports = { RADAR_DB_NAME: 'radars_eg.db', openRadarDatabase };
