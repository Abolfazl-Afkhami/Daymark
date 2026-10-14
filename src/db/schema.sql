PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;

-- 1. Application Preferences (Single-row configuration table enforced by CHECK id = 1)
CREATE TABLE IF NOT EXISTS app_preferences (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  ui_locale TEXT NOT NULL DEFAULT 'en' CHECK (ui_locale IN ('en', 'fa')),
  calendar_system TEXT NOT NULL DEFAULT 'gregorian' CHECK (calendar_system IN ('gregorian', 'persian')),
  numeral_system TEXT NOT NULL DEFAULT 'latn' CHECK (numeral_system IN ('latn', 'arabext')),
  time_zone TEXT NOT NULL DEFAULT 'UTC',
  week_start_day INTEGER NOT NULL DEFAULT 1 CHECK (week_start_day BETWEEN 0 AND 6),
  day_rollover_hour INTEGER NOT NULL DEFAULT 4 CHECK (day_rollover_hour BETWEEN 0 AND 6),
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  updated_at TEXT NOT NULL
);

-- 2. Categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  color_hex TEXT NOT NULL DEFAULT '#2563EB',
  icon_name TEXT NOT NULL DEFAULT 'Folder',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(is_archived, sort_order);

-- 3. Habits
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'ARCHIVED')),
  habit_type TEXT NOT NULL CHECK (habit_type IN ('BINARY', 'QUANTITATIVE')),
  start_date TEXT NOT NULL CHECK (length(start_date) = 10),
  end_date TEXT CHECK (end_date IS NULL OR (length(end_date) = 10 AND end_date >= start_date)),
  reminder_time TEXT CHECK (reminder_time IS NULL OR length(reminder_time) = 5),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_habits_category_status ON habits(category_id, status, sort_order);

-- 4. Habit Schedule Versions (Temporal versioning of schedules & targets)
CREATE TABLE IF NOT EXISTS habit_schedule_versions (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  effective_from_date TEXT NOT NULL CHECK (length(effective_from_date) = 10),
  effective_to_date TEXT CHECK (effective_to_date IS NULL OR (length(effective_to_date) = 10 AND effective_to_date >= effective_from_date)),
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('DAILY', 'WEEKDAYS', 'WEEKLY_TARGET', 'INTERVAL')),
  weekdays_mask INTEGER CHECK (weekdays_mask IS NULL OR (weekdays_mask BETWEEN 1 AND 127)), -- Bitmask: bit 0=Sun .. bit 6=Sat
  weekly_target_count INTEGER CHECK (weekly_target_count IS NULL OR (weekly_target_count BETWEEN 1 AND 7)),
  interval_days INTEGER CHECK (interval_days IS NULL OR (interval_days BETWEEN 2 AND 365)),
  target_value REAL CHECK (target_value IS NULL OR target_value > 0),
  target_unit TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(habit_id, effective_from_date)
);
CREATE INDEX IF NOT EXISTS idx_schedule_versions_lookup ON habit_schedule_versions(habit_id, effective_from_date, effective_to_date);

-- 5. Habit Pause Periods (Preserves exact pause windows for historical streak evaluation)
CREATE TABLE IF NOT EXISTS habit_pause_periods (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  paused_from_date TEXT NOT NULL CHECK (length(paused_from_date) = 10),
  paused_to_date TEXT CHECK (paused_to_date IS NULL OR (length(paused_to_date) = 10 AND paused_to_date >= paused_from_date)),
  reason TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pause_periods_habit ON habit_pause_periods(habit_id, paused_from_date);

-- 6. Habit Completion Logs
CREATE TABLE IF NOT EXISTS habit_logs (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  log_date TEXT NOT NULL CHECK (length(log_date) = 10),
  status TEXT NOT NULL CHECK (status IN ('COMPLETED', 'PARTIAL', 'SKIPPED', 'MISSED')),
  value REAL NOT NULL DEFAULT 0 CHECK (value >= 0),
  target_value_snapshot REAL CHECK (target_value_snapshot IS NULL OR target_value_snapshot > 0),
  target_unit_snapshot TEXT,
  was_scheduled_snapshot INTEGER NOT NULL DEFAULT 1 CHECK (was_scheduled_snapshot IN (0, 1)),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(habit_id, log_date)
);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(log_date, status);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON habit_logs(habit_id, log_date DESC);

-- 7. Goals
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'PAUSED', 'ABANDONED')),
  start_date TEXT NOT NULL CHECK (length(start_date) = 10),
  deadline_date TEXT CHECK (deadline_date IS NULL OR (length(deadline_date) = 10 AND deadline_date >= start_date)),
  progress_source TEXT NOT NULL DEFAULT 'MANUAL' CHECK (
    progress_source IN ('MANUAL', 'HABIT_SUM', 'SESSION_DURATION', 'SESSION_QUESTIONS', 'PROJECT_TASKS')
  ),
  linked_habit_id TEXT REFERENCES habits(id) ON DELETE SET NULL,
  linked_session_type TEXT,
  target_value REAL NOT NULL CHECK (target_value > 0),
  manual_current_value REAL NOT NULL DEFAULT 0 CHECK (manual_current_value >= 0),
  unit TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_goals_status_category ON goals(status, category_id);

-- 8. Projects
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  goal_id TEXT REFERENCES goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'ON_HOLD', 'ARCHIVED')),
  deadline_date TEXT CHECK (deadline_date IS NULL OR length(deadline_date) = 10),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_projects_status_goal ON projects(status, goal_id);

-- 9. Tasks and Subtasks (Max 1 nesting level enforced in application service)
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  parent_task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED')),
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  due_date TEXT CHECK (due_date IS NULL OR length(due_date) = 10),
  completed_at TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (id != parent_task_id)
);
CREATE INDEX IF NOT EXISTS idx_tasks_due_status ON tasks(status, due_date, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id, parent_task_id, sort_order);

-- 10. Study and Work Sessions
CREATE TABLE IF NOT EXISTS study_sessions (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  goal_id TEXT REFERENCES goals(id) ON DELETE SET NULL,
  subject_tag TEXT,
  session_type TEXT NOT NULL CHECK (
    session_type IN ('STUDY', 'PRACTICE_QUESTIONS', 'ERROR_REVIEW', 'CODING', 'RESEARCH', 'MOCK_EXAM')
  ),
  session_date TEXT NOT NULL CHECK (length(session_date) = 10),
  start_time_utc TEXT NOT NULL,
  end_time_utc TEXT NOT NULL,
  time_zone TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes BETWEEN 1 AND 960),
  questions_completed INTEGER CHECK (questions_completed IS NULL OR questions_completed >= 0),
  is_concurrent_overlap INTEGER NOT NULL DEFAULT 0 CHECK (is_concurrent_overlap IN (0, 1)),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (end_time_utc > start_time_utc)
);
CREATE INDEX IF NOT EXISTS idx_sessions_date_category ON study_sessions(session_date DESC, category_id);
CREATE INDEX IF NOT EXISTS idx_sessions_utc_window ON study_sessions(start_time_utc, end_time_utc);

-- 11. Spaced Repetition (SM-2)
CREATE TABLE IF NOT EXISTS study_reviews (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  area_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  repetition_count INTEGER NOT NULL DEFAULT 0,
  ease_factor REAL NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 1,
  next_review_date TEXT NOT NULL, -- YYYY-MM-DD (Civil Date)
  last_reviewed_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_study_reviews_next_date ON study_reviews(next_review_date);

-- 12. Practice & Test Analytics
CREATE TABLE IF NOT EXISTS practice_logs (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES study_sessions(id) ON DELETE CASCADE,
  area_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  total_questions INTEGER NOT NULL CHECK (total_questions > 0),
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  blank_count INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  civil_date TEXT NOT NULL, -- YYYY-MM-DD
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_practice_logs_date ON practice_logs(civil_date);

-- 13. TIL / Knowledge Vault & Snippets
CREATE TABLE IF NOT EXISTS knowledge_notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Markdown / Code / LaTeX
  language TEXT DEFAULT 'markdown', -- ts, python, rust, cpp, sql, math, markdown
  tags TEXT NOT NULL DEFAULT '[]', -- JSON Array of tags
  area_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  civil_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- SQLite FTS5 Full-Text Search Virtual Table
CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_notes_fts USING fts5(
  note_id UNINDEXED,
  title,
  content,
  tags
);
