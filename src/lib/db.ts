import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "coy-discover.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      photo TEXT NOT NULL,
      bio TEXT NOT NULL,
      location TEXT NOT NULL,
      interests TEXT NOT NULL DEFAULT '[]',
      incoming_like INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS swipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL DEFAULT 'demo-user',
      profile_id TEXT NOT NULL,
      action TEXT NOT NULL CHECK(action IN ('like', 'pass')),
      is_match INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, profile_id)
    );

    CREATE INDEX IF NOT EXISTS idx_swipes_user ON swipes(user_id);
    CREATE INDEX IF NOT EXISTS idx_swipes_match ON swipes(user_id, is_match);
  `);
}

/** Run a function inside a transaction for atomicity */
export function transaction<T>(fn: () => T): T {
  const db = getDb();
  const run = db.transaction(fn);
  return run();
}

/** Close DB connection (useful for tests and reset) */
export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}

/** Completely reset database — drops all data and re-runs schema */
export function resetDb(): void {
  const db = getDb();
  db.exec(`
    DELETE FROM swipes;
    DELETE FROM profiles;
  `);
}
