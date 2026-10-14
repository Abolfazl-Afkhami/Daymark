import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'daymark.db');

declare global {
  // eslint-disable-next-line no-var
  var __daymark_sqlite: Database.Database | undefined;
}

function getDatabase(): Database.Database {
  if (process.env.NODE_ENV === 'production') {
    const sqlite = new Database(dbPath);
    configurePragmas(sqlite);
    return sqlite;
  }

  if (!global.__daymark_sqlite) {
    const sqlite = new Database(dbPath);
    configurePragmas(sqlite);
    global.__daymark_sqlite = sqlite;
  }

  return global.__daymark_sqlite;
}

function configurePragmas(sqlite: Database.Database) {
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('synchronous = NORMAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('busy_timeout = 5000');
}

export const sqlite = getDatabase();
export const db = drizzle(sqlite, { schema });
