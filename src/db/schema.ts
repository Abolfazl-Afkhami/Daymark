import { sqliteTable, text, integer, real, index, unique } from 'drizzle-orm/sqlite-core';

// 1. Application Preferences
export const appPreferences = sqliteTable('app_preferences', {
  id: integer('id').primaryKey(),
  uiLocale: text('ui_locale').notNull().default('en'),
  calendarSystem: text('calendar_system').notNull().default('gregorian'),
  numeralSystem: text('numeral_system').notNull().default('latn'),
  timeZone: text('time_zone').notNull().default('UTC'),
  weekStartDay: integer('week_start_day').notNull().default(1),
  dayRolloverHour: integer('day_rollover_hour').notNull().default(4),
  theme: text('theme').notNull().default('system'),
  updatedAt: text('updated_at').notNull(),
});

// 2. Categories
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  colorHex: text('color_hex').notNull().default('#2563EB'),
  iconName: text('icon_name').notNull().default('Folder'),
  sortOrder: integer('sort_order').notNull().default(0),
  isArchived: integer('is_archived').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('idx_categories_sort').on(table.isArchived, table.sortOrder),
]);

// 3. Habits
export const habits = sqliteTable('habits', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'restrict' }),
  name: text('name').notNull(),
  description: text('description'),
  iconName: text('icon_name'),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, PAUSED, ARCHIVED
  habitType: text('habit_type').notNull(), // BINARY, QUANTITATIVE
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  reminderTime: text('reminder_time'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('idx_habits_category_status').on(table.categoryId, table.status, table.sortOrder),
]);

// 4. Habit Schedule Versions
export const habitScheduleVersions = sqliteTable('habit_schedule_versions', {
  id: text('id').primaryKey(),
  habitId: text('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  effectiveFromDate: text('effective_from_date').notNull(),
  effectiveToDate: text('effective_to_date'),
  scheduleType: text('schedule_type').notNull(), // DAILY, WEEKDAYS, WEEKLY_TARGET, INTERVAL
  weekdaysMask: integer('weekdays_mask'),
  weeklyTargetCount: integer('weekly_target_count'),
  intervalDays: integer('interval_days'),
  targetValue: real('target_value'),
  targetUnit: text('target_unit'),
  createdAt: text('created_at').notNull(),
}, (table) => [
  unique().on(table.habitId, table.effectiveFromDate),
  index('idx_schedule_versions_lookup').on(table.habitId, table.effectiveFromDate, table.effectiveToDate),
]);

// 5. Habit Pause Periods
export const habitPausePeriods = sqliteTable('habit_pause_periods', {
  id: text('id').primaryKey(),
  habitId: text('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  pausedFromDate: text('paused_from_date').notNull(),
  pausedToDate: text('paused_to_date'),
  reason: text('reason'),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('idx_pause_periods_habit').on(table.habitId, table.pausedFromDate),
]);

// 6. Habit Completion Logs
export const habitLogs = sqliteTable('habit_logs', {
  id: text('id').primaryKey(),
  habitId: text('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  logDate: text('log_date').notNull(),
  status: text('status').notNull(), // COMPLETED, PARTIAL, SKIPPED, MISSED
  value: real('value').notNull().default(0),
  targetValueSnapshot: real('target_value_snapshot'),
  targetUnitSnapshot: text('target_unit_snapshot'),
  wasScheduledSnapshot: integer('was_scheduled_snapshot').notNull().default(1),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  unique().on(table.habitId, table.logDate),
  index('idx_habit_logs_date').on(table.logDate, table.status),
  index('idx_habit_logs_habit_date').on(table.habitId, table.logDate),
]);

// 7. Goals
export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'restrict' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, COMPLETED, PAUSED, ABANDONED
  startDate: text('start_date').notNull(),
  deadlineDate: text('deadline_date'),
  progressSource: text('progress_source').notNull().default('MANUAL'),
  linkedHabitId: text('linked_habit_id').references(() => habits.id, { onDelete: 'set null' }),
  linkedSessionType: text('linked_session_type'),
  targetValue: real('target_value').notNull(),
  manualCurrentValue: real('manual_current_value').notNull().default(0),
  unit: text('unit').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('idx_goals_status_category').on(table.status, table.categoryId),
]);

// 8. Projects
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'restrict' }),
  goalId: text('goal_id').references(() => goals.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, COMPLETED, ON_HOLD, ARCHIVED
  deadlineDate: text('deadline_date'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('idx_projects_status_goal').on(table.status, table.goalId),
]);

// 9. Tasks
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  parentTaskId: text('parent_task_id'),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  notes: text('notes'),
  status: text('status').notNull().default('TODO'), // TODO, IN_PROGRESS, DONE, CANCELLED
  priority: text('priority').notNull().default('MEDIUM'), // LOW, MEDIUM, HIGH, CRITICAL
  dueDate: text('due_date'),
  completedAt: text('completed_at'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('idx_tasks_due_status').on(table.status, table.dueDate, table.priority),
  index('idx_tasks_project').on(table.projectId, table.parentTaskId, table.sortOrder),
]);

// 10. Study Sessions
export const studySessions = sqliteTable('study_sessions', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'restrict' }),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  goalId: text('goal_id').references(() => goals.id, { onDelete: 'set null' }),
  subjectTag: text('subject_tag'),
  sessionType: text('session_type').notNull(), // STUDY, PRACTICE_QUESTIONS, ERROR_REVIEW, CODING, RESEARCH, MOCK_EXAM
  sessionDate: text('session_date').notNull(),
  startTimeUtc: text('start_time_utc').notNull(),
  endTimeUtc: text('end_time_utc').notNull(),
  timeZone: text('time_zone').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  questionsCompleted: integer('questions_completed'),
  isConcurrentOverlap: integer('is_concurrent_overlap').notNull().default(0),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('idx_sessions_date_category').on(table.sessionDate, table.categoryId),
  index('idx_sessions_utc_window').on(table.startTimeUtc, table.endTimeUtc),
]);

// 11. Study Reviews (Spaced Repetition SM-2)
export const studyReviews = sqliteTable('study_reviews', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  areaId: text('area_id').references(() => categories.id, { onDelete: 'set null' }),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  repetitionCount: integer('repetition_count').notNull().default(0),
  easeFactor: real('ease_factor').notNull().default(2.5),
  intervalDays: integer('interval_days').notNull().default(1),
  nextReviewDate: text('next_review_date').notNull(),
  lastReviewedDate: text('last_reviewed_date'),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('idx_study_reviews_next_date').on(table.nextReviewDate),
]);

// 12. Practice Logs & Problem-Solving
export const practiceLogs = sqliteTable('practice_logs', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').references(() => studySessions.id, { onDelete: 'cascade' }),
  areaId: text('area_id').references(() => categories.id, { onDelete: 'set null' }),
  topic: text('topic').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  correctCount: integer('correct_count').notNull().default(0),
  wrongCount: integer('wrong_count').notNull().default(0),
  blankCount: integer('blank_count').notNull().default(0),
  durationMinutes: integer('duration_minutes').notNull().default(0),
  civilDate: text('civil_date').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('idx_practice_logs_date').on(table.civilDate),
]);

// 13. Knowledge Notes (TIL & Snippet Vault)
export const knowledgeNotes = sqliteTable('knowledge_notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  language: text('language').default('markdown'),
  tags: text('tags').notNull().default('[]'),
  areaId: text('area_id').references(() => categories.id, { onDelete: 'set null' }),
  isPinned: integer('is_pinned').notNull().default(0),
  civilDate: text('civil_date').notNull(),
  createdAt: text('created_at').notNull(),
});
