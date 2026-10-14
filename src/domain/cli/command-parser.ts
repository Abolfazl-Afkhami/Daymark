// src/domain/cli/command-parser.ts

export type ParsedCLICommand =
  | { type: 'FOCUS'; durationMinutes: number; tag?: string }
  | { type: 'REVIEW_ADD'; title: string }
  | { type: 'TIL_ADD'; title: string; tag?: string }
  | { type: 'TEST_LOG'; total: number; correct: number; wrong: number; topic: string }
  | { type: 'SEARCH'; query: string };

/**
 * نمونه‌های سینتکس پشتیبانی‌شده:
 * "f 45 #physics"       -> شروع تایمر تمرکز ۴۵ دقیقه‌ای
 * "r قضایای مشتق و حد"   -> افزودن مبحث به چرخه مرور SM-2
 * "til قانون مالکیت در Rust #rust" -> ثبت نکته سریع در خزانه دانش
 * "test 25 20 3 دینامیک" -> ثبت ۲۵ تست (۲۰ درست، ۳ غلط) برای مبحث دینامیک
 */
export function parseCLICommand(input: string): ParsedCLICommand {
  const trimmed = input.trim();

  // 1. Focus Command: f <minutes> [#tag]
  const focusMatch = trimmed.match(/^f\s+(\d+)m?(?:\s+#(\S+))?$/i);
  if (focusMatch && focusMatch[1]) {
    return {
      type: 'FOCUS',
      durationMinutes: Math.min(240, Math.max(5, parseInt(focusMatch[1], 10))),
      tag: focusMatch[2],
    };
  }

  // 2. Spaced Repetition Review Add: r <title>
  const reviewMatch = trimmed.match(/^r\s+(.+)$/i);
  if (reviewMatch && reviewMatch[1]) {
    return {
      type: 'REVIEW_ADD',
      title: reviewMatch[1].trim(),
    };
  }

  // 3. Today I Learned (Quick Note): til <title> [#tag]
  const tilMatch = trimmed.match(/^til\s+(.+?)(?:\s+#(\S+))?$/i);
  if (tilMatch && tilMatch[1]) {
    return {
      type: 'TIL_ADD',
      title: tilMatch[1].trim(),
      tag: tilMatch[2],
    };
  }

  // 4. Quick Test Log: test <total> <correct> <wrong> <topic>
  const testMatch = trimmed.match(/^test\s+(\d+)\s+(\d+)\s+(\d+)\s+(.+)$/i);
  if (testMatch && testMatch[1] && testMatch[2] && testMatch[3] && testMatch[4]) {
    return {
      type: 'TEST_LOG',
      total: parseInt(testMatch[1], 10),
      correct: parseInt(testMatch[2], 10),
      wrong: parseInt(testMatch[3], 10),
      topic: testMatch[4].trim(),
    };
  }

  return { type: 'SEARCH', query: trimmed };
}
