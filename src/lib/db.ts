import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "coy-discover.db");

type SqliteDb = {
  exec: (sql: string) => void;
  prepare: (sql: string) => {
    all: (...args: unknown[]) => unknown[];
    get: (...args: unknown[]) => unknown;
    run: (...args: unknown[]) => unknown;
  };
  transaction: <T>(fn: () => T) => () => T;
  pragma: (sql: string) => void;
  close: () => void;
};

let _db: SqliteDb | null = null;

export function isServerlessMode(): boolean {
  // If explicitly Vercel and no local file/Turso URL is provided, run in serverless mode
  return (process.env.VERCEL === "1" || !!process.env.NEXT_PUBLIC_VERCEL_ENV) && !process.env.TURSO_DATABASE_URL;
}

export function getDb(): SqliteDb | null {
  if (isServerlessMode()) {
    return null;
  }

  if (!_db) {
    try {
      const Database = require("better-sqlite3");
      _db = new Database(DB_PATH);
      _db?.pragma("journal_mode = WAL");
      _db?.pragma("foreign_keys = ON");
      if (_db) initSchema(_db);
    } catch (err) {
      console.warn("Local SQLite initialization skipped or running serverless:", err);
      return null;
    }
  }
  return _db;
}

function initSchema(db: SqliteDb): void {
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
  if (!db) {
    return fn();
  }
  const run = db.transaction(fn);
  return run();
}

/** Close DB connection (useful for tests and reset) */
export function closeDb(): void {
  if (_db) {
    try {
      _db.close();
    } catch {}
    _db = null;
  }
}

/** Completely reset database — drops all data and re-runs schema */
export function resetDb(): void {
  const db = getDb();
  if (db) {
    db.exec(`
      DELETE FROM swipes;
      DELETE FROM profiles;
    `);
  }
}
