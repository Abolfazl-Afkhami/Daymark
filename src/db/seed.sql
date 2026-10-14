-- Default Application Preferences
INSERT OR IGNORE INTO app_preferences (
  id, ui_locale, calendar_system, numeral_system, time_zone, week_start_day, day_rollover_hour, theme, updated_at
) VALUES (
  1, 'fa', 'persian', 'arabext', 'Asia/Tehran', 6, 4, 'system', datetime('now')
);

-- 4 Core Life Areas (Categories)
INSERT OR IGNORE INTO categories (id, name, slug, color_hex, icon_name, sort_order, is_archived, created_at, updated_at)
VALUES 
  ('cat_academic', 'مطالعات تحصیلی (Academic Studies)', 'academic-studies', '#4F46E5', 'GraduationCap', 1, 0, datetime('now'), datetime('now')),
  ('cat_ai', 'مهندسی هوش مصنوعی (AI Engineering)', 'ai-engineering', '#7C3AED', 'Bot', 2, 0, datetime('now'), datetime('now')),
  ('cat_programming', 'برنامه‌نویسی و توسعه (Programming & Dev)', 'programming-dev', '#0891B2', 'Code', 3, 0, datetime('now'), datetime('now')),
  ('cat_personal', 'رشد و توسعه فردی (Personal Development)', 'personal-development', '#059669', 'Heart', 4, 0, datetime('now'), datetime('now'));
