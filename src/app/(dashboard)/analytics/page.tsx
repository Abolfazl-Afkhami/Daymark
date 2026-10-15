// src/app/(dashboard)/analytics/page.tsx
import { sqlite } from '@/db/client';
import { AnalyticsChartsClient } from '@/components/analytics/AnalyticsChartsClient';
import { ActivityHeatmap } from '@/components/analytics/ActivityHeatmap';
import {
  BarChart3,
  Clock,
  Target,
  CheckCircle2,
  Award,
  TrendingUp,
  AlertTriangle,
  Brain,
  Calendar,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const todayIso = new Date().toISOString().slice(0, 10);

  // ۱. آمار کلی جلسات مطالعه و تست‌ها
  const sessionStats = sqlite
    .prepare(
      `SELECT 
        COALESCE(SUM(duration_minutes), 0) as total_minutes,
        COALESCE(SUM(questions_completed), 0) as total_session_questions,
        COUNT(*) as sessions_count
      FROM study_sessions`
    )
    .get() as { total_minutes: number; total_session_questions: number; sessions_count: number };

  // ۲. آمار کلی تست‌زنی از جدول practice_logs
  const practiceStats = sqlite
    .prepare(
      `SELECT
        COALESCE(SUM(total_questions), 0) as total_q,
        COALESCE(SUM(correct_count), 0) as total_c,
        COALESCE(SUM(wrong_count), 0) as total_w,
        COALESCE(SUM(duration_minutes), 0) as total_dur
      FROM practice_logs`
    )
    .get() as { total_q: number; total_c: number; total_w: number; total_dur: number };

  const netAccuracyPct =
    practiceStats.total_q > 0
      ? Math.round(
          (((practiceStats.total_c * 3 - practiceStats.total_w) /
            (practiceStats.total_q * 3)) *
            100) *
            10
        ) / 10
      : 0;

  const avgSecondsPerQuestion =
    practiceStats.total_q > 0
      ? Math.round((practiceStats.total_dur * 60) / practiceStats.total_q)
      : 0;

  // ۳. نرخ پایبندی عادت‌ها در ۳۰ روز اخیر (با حذف روزهای SKIPPED از مخرج کسر)
  const habitRateRow = sqlite
    .prepare(
      `SELECT
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_cnt,
        COUNT(CASE WHEN status IN ('COMPLETED', 'PARTIAL', 'MISSED') THEN 1 END) as eval_cnt
      FROM habit_logs
      WHERE log_date >= date('now', '-30 days')`
    )
    .get() as { completed_cnt: number; eval_cnt: number };

  const strictHabitRate =
    habitRateRow.eval_cnt > 0
      ? Math.round((habitRateRow.completed_cnt / habitRateRow.eval_cnt) * 100)
      : 100;

  // ۴. روند ۱۴ روز گذشته برای نمودار ترکیبی
  const dailyTrend: Array<{
    date: string;
    focusMinutes: number;
    questionsSolved: number;
    habitCompletionRate: number;
  }> = [];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    const sesRow = sqlite
      .prepare(
        `SELECT 
          COALESCE(SUM(duration_minutes), 0) as mins,
          COALESCE(SUM(questions_completed), 0) as qs
        FROM study_sessions WHERE session_date = ?`
      )
      .get(d) as { mins: number; qs: number };

    const prcRow = sqlite
      .prepare(
        `SELECT COALESCE(SUM(total_questions), 0) as pqs
        FROM practice_logs WHERE civil_date = ?`
      )
      .get(d) as { pqs: number };

    dailyTrend.push({
      date: d.slice(5), // MM-DD
      focusMinutes: sesRow.mins,
      questionsSolved: Math.max(sesRow.qs, prcRow.pqs),
      habitCompletionRate: 0,
    });
  }

  // ۵. توزیع زمان مطالعه به تفکیک دسته‌بندی‌ها
  const catRows = sqlite
    .prepare(
      `SELECT 
        c.name,
        c.color_hex as color,
        COALESCE(SUM(s.duration_minutes), 0) as minutes,
        COALESCE(SUM(s.questions_completed), 0) as questions
      FROM categories c
      LEFT JOIN study_sessions s ON s.category_id = c.id
      WHERE c.is_archived = 0
      GROUP BY c.id
      ORDER BY minutes DESC`
    )
    .all() as Array<{ name: string; color: string; minutes: number; questions: number }>;

  const categoryDist = catRows.map((r) => ({
    ...r,
    hours: Math.round((r.minutes / 60) * 10) / 10,
  }));

  // ۶. روند آزمون‌های آزمایشی
  const examRows = sqlite
    .prepare(
      `SELECT title, exam_date, COALESCE(total_taraz, 0) as taraz, overall_percentage as percentage
      FROM mock_exams
      ORDER BY exam_date ASC
      LIMIT 15`
    )
    .all() as Array<{ title: string; exam_date: string; taraz: number; percentage: number }>;

  const mockExamTrend = examRows.map((e) => ({
    title: e.title,
    date: e.exam_date.slice(5),
    taraz: e.taraz,
    percentage: e.percentage,
  }));

  // ۷. توزیع ساعات اوج تمرکز در ۲۴ ساعت شبانه‌روز
  const allSessionsUtc = sqlite
    .prepare(`SELECT start_time_utc, duration_minutes FROM study_sessions`)
    .all() as Array<{ start_time_utc: string; duration_minutes: number }>;

  const hourBuckets = new Array(24).fill(0);
  for (const s of allSessionsUtc) {
    const dt = new Date(s.start_time_utc);
    if (!isNaN(dt.getTime())) {
      const hour = dt.getHours();
      hourBuckets[hour] = (hourBuckets[hour] ?? 0) + s.duration_minutes;
    }
  }

  const hourlyDist = hourBuckets.map((mins, h) => ({
    hourLabel: `${String(h).padStart(2, '0')}:00`,
    minutes: mins,
  }));

  // ۸. پیش‌بینی سرعت تحقق اهداف فعال (Goal Velocity Forecasting)
  const activeGoals = sqlite
    .prepare(
      `SELECT id, title, start_date, deadline_date, progress_source, target_value, manual_current_value, unit
      FROM goals WHERE status = 'ACTIVE'`
    )
    .all() as Array<{
    id: string;
    title: string;
    start_date: string;
    deadline_date: string | null;
    progress_source: string;
    target_value: number;
    manual_current_value: number;
    unit: string;
  }>;

  const goalForecasts = activeGoals.map((g) => {
    let currentVal = g.manual_current_value;
    if (g.progress_source === 'SESSION_QUESTIONS') {
      const qSum = sqlite
        .prepare(
          `SELECT COALESCE(SUM(questions_completed), 0) as s FROM study_sessions WHERE goal_id = ?`
        )
        .get(g.id) as { s: number };
      currentVal = Math.max(currentVal, qSum.s);
    } else if (g.progress_source === 'SESSION_DURATION') {
      const dSum = sqlite
        .prepare(
          `SELECT COALESCE(SUM(duration_minutes), 0) as s FROM study_sessions WHERE goal_id = ?`
        )
        .get(g.id) as { s: number };
      currentVal = Math.max(currentVal, Math.round((dSum.s / 60) * 10) / 10);
    }

    const elapsedDays = Math.max(
      1,
      Math.ceil((Date.now() - new Date(g.start_date).getTime()) / 86_400_000)
    );
    const dailyVelocity = currentVal / elapsedDays;
    const remaining = Math.max(0, g.target_value - currentVal);
    const daysToFinish =
      dailyVelocity > 0 ? Math.ceil(remaining / dailyVelocity) : null;

    return {
      ...g,
      currentVal,
      pct: Math.min(100, Math.round((currentVal / g.target_value) * 100)),
      dailyVelocity: Math.round(dailyVelocity * 10) / 10,
      daysToFinish,
    };
  });

  // ۹. کارت‌های مرور SM-2 سررسید شده
  const dueReviewsCount = (
    sqlite
      .prepare(`SELECT COUNT(*) as cnt FROM study_reviews WHERE next_review_date <= ?`)
      .get(todayIso) as { cnt: number }
  ).cnt;

  const totalFocusHours = Math.round((sessionStats.total_minutes / 60) * 10) / 10;
  const combinedTotalQuestions = Math.max(
    sessionStats.total_session_questions,
    practiceStats.total_q
  );

  // ۱۰. نقشه حرارتی فعالیت (Heatmap)
  const activityRows = sqlite
    .prepare(
      `SELECT session_date as dt, COUNT(*) as cnt FROM study_sessions GROUP BY session_date
       UNION ALL
       SELECT log_date as dt, COUNT(*) as cnt FROM habit_logs WHERE status = 'COMPLETED' GROUP BY log_date`
    )
    .all() as Array<{ dt: string; cnt: number }>;

  const activityMap: Record<string, number> = {};
  for (const r of activityRows) {
    activityMap[r.dt] = (activityMap[r.dt] || 0) + r.cnt;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-accent" />
          <span>داشبورد جامع تحلیل عملکرد و پیشرفت (Analytics)</span>
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          تحلیل چندبعدی کار عمیق، دقت تست‌زنی با نمره منفی، روند تراز آزمون‌های آزمایشی و پیش‌بینی سرعت تحقق اهداف
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border-subtle rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>مجموع ساعت کار عمیق</span>
            <Clock className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-extrabold tabular-nums text-text-main">
            {totalFocusHours} <span className="text-xs font-normal text-text-muted">ساعت</span>
          </div>
          <div className="text-[11px] text-text-muted tabular-nums">
            در طی {sessionStats.sessions_count} جلسه ثبت‌شده
          </div>
        </div>

        <div className="bg-surface border border-border-subtle rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>کل تست‌های حل‌شده و دقت</span>
            <Target className="w-4 h-4 text-status-complete" />
          </div>
          <div className="text-2xl font-extrabold tabular-nums text-text-main">
            {combinedTotalQuestions}{' '}
            <span className="text-xs font-semibold text-status-complete">
              ({netAccuracyPct}% خالص)
            </span>
          </div>
          <div className="text-[11px] text-text-muted tabular-nums">
            سرعت میانگین: {avgSecondsPerQuestion} ثانیه به ازای هر تست
          </div>
        </div>

        <div className="bg-surface border border-border-subtle rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>نرخ پایبندی خالص عادات (۳۰ روزه)</span>
            <CheckCircle2 className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-extrabold tabular-nums text-text-main">
            {strictHabitRate}%
          </div>
          <div className="text-[11px] text-text-muted">
            محاسبه دقیق با حذف روزهای مرخصی (SKIPPED)
          </div>
        </div>

        <div className="bg-surface border border-border-subtle rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>وضعیت مرورهای فعال (SM-2)</span>
            <Brain className="w-4 h-4 text-status-partial" />
          </div>
          <div className="text-2xl font-extrabold tabular-nums text-text-main">
            {dueReviewsCount}{' '}
            <span className="text-xs font-normal text-text-muted">مبحث آماده مرور</span>
          </div>
          <div className="text-[11px] text-text-muted">
            بر اساس منحنی فراموشی الگوریتم SuperMemo-2
          </div>
        </div>
      </div>

      {/* 365-Day Activity Heatmap */}
      <ActivityHeatmap activityData={activityMap as any} weeksToShow={32} />

      {/* Interactive Recharts Grid */}
      <AnalyticsChartsClient
        dailyTrend={dailyTrend}
        categoryDist={categoryDist}
        mockExamTrend={mockExamTrend}
        hourlyDist={hourlyDist}
      />

      {/* Goal Velocity & Pace Forecasting Table */}
      <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span>پیش‌بینی هوشمند زمان اتمام اهداف بر اساس سرعت فعلی (Pace Forecasting)</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            محاسبه نرخ پیشروی روزانه شما از تاریخ شروع هدف و تخمین روزهای باقیمانده تا تکمیل ۱۰۰٪
          </p>
        </div>

        {goalForecasts.length === 0 ? (
          <p className="text-xs text-text-muted py-4 text-center">هدف فعالی یافت نشد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-elevated text-text-muted border-b border-border-subtle">
                <tr>
                  <th className="py-2.5 px-3 text-start">عنوان هدف</th>
                  <th className="py-2.5 px-3 text-center">پیشرفت فعلی</th>
                  <th className="py-2.5 px-3 text-center">درصد تحقق</th>
                  <th className="py-2.5 px-3 text-center">سرعت میانگین روزانه</th>
                  <th className="py-2.5 px-3 text-center">تخمین زمان اتمام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle tabular-nums">
                {goalForecasts.map((g) => (
                  <tr key={g.id} className="hover:bg-elevated/40">
                    <td className="py-2.5 px-3 font-bold text-text-main">{g.title}</td>
                    <td className="py-2.5 px-3 text-center">
                      {g.currentVal} از {g.target_value} {g.unit}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-accent/15 text-accent font-bold">
                        {g.pct}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold">
                      {g.dailyVelocity} {g.unit} در روز
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {g.daysToFinish === 0 ? (
                        <span className="text-status-complete font-bold">تکمیل شده</span>
                      ) : g.daysToFinish !== null ? (
                        <span className="font-semibold text-text-main">
                          حدود {g.daysToFinish} روز دیگر
                        </span>
                      ) : (
                        <span className="text-status-partial">نیازمند ثبت فعالیت اول</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
