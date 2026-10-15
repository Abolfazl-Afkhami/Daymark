// src/db/client.ts
import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import * as schema from './schema';

const DB_PATH = process.env.DATABASE_PATH || process.env.DATABASE_URL || path.join(process.cwd(), 'daymark.db');

type GlobalWithDb = typeof globalThis & {
  __daymark_sqlite?: Database.Database;
  __daymark_db?: BetterSQLite3Database<typeof schema>;
  __daymark_stmt_cache?: Map<string, Database.Statement>;
  __daymark_migrated_v112?: boolean;
};

const globalForDb = globalThis as GlobalWithDb;

function createSqliteSingleton(): Database.Database {
  if (globalForDb.__daymark_sqlite && globalForDb.__daymark_sqlite.open) {
    return globalForDb.__daymark_sqlite;
  }

  const instance = new Database(DB_PATH, {
    timeout: 5000,
  });

  // تنظیمات پایداری و همزمانی WAL
  instance.pragma('journal_mode = WAL');
  instance.pragma('synchronous = NORMAL');
  instance.pragma('foreign_keys = ON');
  instance.pragma('busy_timeout = 5000');

  // کش سراسری Statement ها برای جلوگیری از فراخوانی Destructor در C++ و کرش env != nullptr
  if (!globalForDb.__daymark_stmt_cache) {
    globalForDb.__daymark_stmt_cache = new Map<string, Database.Statement>();
  }

  const originalPrepare = instance.prepare.bind(instance);
  instance.prepare = ((source: string, ...rest: unknown[]) => {
    const cache = globalForDb.__daymark_stmt_cache!;
    let stmt = cache.get(source);
    if (!stmt) {
      stmt = (originalPrepare as Function)(source, ...rest);
      cache.set(source, stmt!);
    }
    return stmt;
  }) as typeof instance.prepare;

  globalForDb.__daymark_sqlite = instance;
  return instance;
}

/**
 * مایگریشن خودکار و ایمن به نسخه 1.1.2 بدون حذف داده‌های فعلی کاربر
 */
function runAutoMigrationsV112(conn: Database.Database) {
  if (globalForDb.__daymark_migrated_v112) return;

  try {
    // بررسی اولیه بدون ترنزکشن (Read-only بدون قفل انحصاری)
    const prefTableSql = conn
      .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'app_preferences'")
      .get() as { sql?: string } | undefined;
    const mockTable = conn
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'mock_exams'")
      .get();

    if (prefTableSql?.sql?.includes("'sepia'") && mockTable) {
      globalForDb.__daymark_migrated_v112 = true;
      return;
    }

    // اگر نیاز به مایگریشن باشد، با غیرفعال کردن موقت foreign_keys انجام می‌شود
    conn.pragma('foreign_keys = OFF');
    conn.transaction(() => {
      if (prefTableSql?.sql && !prefTableSql.sql.includes("'sepia'")) {
        conn.exec(`
          DROP TABLE IF EXISTS app_preferences_v112;
          CREATE TABLE app_preferences_v112 (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            ui_locale TEXT NOT NULL DEFAULT 'fa' CHECK (ui_locale IN ('en', 'fa')),
            calendar_system TEXT NOT NULL DEFAULT 'persian' CHECK (calendar_system IN ('gregorian', 'persian')),
            numeral_system TEXT NOT NULL DEFAULT 'arabext' CHECK (numeral_system IN ('latn', 'arabext')),
            time_zone TEXT NOT NULL DEFAULT 'Asia/Tehran',
            week_start_day INTEGER NOT NULL DEFAULT 6 CHECK (week_start_day BETWEEN 0 AND 6),
            day_rollover_hour INTEGER NOT NULL DEFAULT 4 CHECK (day_rollover_hour BETWEEN 0 AND 6),
            theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'sepia', 'oled', 'system')),
            updated_at TEXT NOT NULL
          );

          INSERT INTO app_preferences_v112 (
            id, ui_locale, calendar_system, numeral_system, time_zone, week_start_day, day_rollover_hour, theme, updated_at
          )
          SELECT
            id, ui_locale, calendar_system, numeral_system, time_zone, week_start_day, day_rollover_hour, theme, updated_at
          FROM app_preferences;

          DROP TABLE app_preferences;
          ALTER TABLE app_preferences_v112 RENAME TO app_preferences;
        `);
      }

      conn.exec(`
        CREATE TABLE IF NOT EXISTS mock_exams (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          organization TEXT,
          exam_date TEXT NOT NULL CHECK (length(exam_date) = 10),
          total_taraz INTEGER,
          rank_city INTEGER,
          rank_country INTEGER,
          overall_percentage REAL NOT NULL DEFAULT 0,
          duration_minutes INTEGER NOT NULL DEFAULT 0,
          notes TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_mock_exams_date ON mock_exams(exam_date DESC);

        CREATE TABLE IF NOT EXISTS mock_exam_subjects (
          id TEXT PRIMARY KEY,
          exam_id TEXT NOT NULL REFERENCES mock_exams(id) ON DELETE CASCADE,
          area_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
          subject_name TEXT NOT NULL,
          coefficient INTEGER NOT NULL DEFAULT 1 CHECK (coefficient >= 1),
          total_questions INTEGER NOT NULL CHECK (total_questions > 0),
          correct_count INTEGER NOT NULL DEFAULT 0,
          wrong_count INTEGER NOT NULL DEFAULT 0,
          blank_count INTEGER NOT NULL DEFAULT 0,
          raw_percentage REAL NOT NULL DEFAULT 0,
          subject_taraz INTEGER,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_mock_exam_subjects_exam ON mock_exam_subjects(exam_id);
      `);
    })();
  } catch (err) {
    console.warn('[Daymark Migration] Notice during auto-migration:', err);
  } finally {
    try {
      conn.pragma('foreign_keys = ON');
    } catch {
      // ignore
    }
  }

  globalForDb.__daymark_migrated_v112 = true;
}

export const sqlite: Database.Database = createSqliteSingleton();
runAutoMigrationsV112(sqlite);

export const db: BetterSQLite3Database<typeof schema> =
  globalForDb.__daymark_db ?? drizzle(sqlite, { schema });

if (!globalForDb.__daymark_db) {
  globalForDb.__daymark_db = db;
}
