// src/components/analytics/AnalyticsChartsClient.tsx
'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

export interface DailyTrendPoint {
  date: string;
  focusMinutes: number;
  questionsSolved: number;
  habitCompletionRate: number;
}

export interface CategoryDistributionPoint {
  name: string;
  color: string;
  minutes: number;
  hours: number;
  questions: number;
}

export interface MockExamTrendPoint {
  title: string;
  date: string;
  taraz: number;
  percentage: number;
}

export interface HourlyDistributionPoint {
  hourLabel: string;
  minutes: number;
}

interface Props {
  dailyTrend: DailyTrendPoint[];
  categoryDist: CategoryDistributionPoint[];
  mockExamTrend: MockExamTrendPoint[];
  hourlyDist: HourlyDistributionPoint[];
}

export function AnalyticsChartsClient({
  dailyTrend,
  categoryDist,
  mockExamTrend,
  hourlyDist,
}: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Daily Focus & Questions Composed Chart */}
      <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm space-y-3">
        <div>
          <h3 className="text-sm font-bold text-text-main">
            روند ۱۴ روزه زمان تمرکز (دقیقه) و حجم تست‌زنی
          </h3>
          <p className="text-xs text-text-muted">
            مقایسه همبستگی بین دقایق مطالعه روزانه و تعداد تست‌های حل‌شده
          </p>
        </div>
        <div className="h-64 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                label={{ value: 'دقیقه', angle: -90, position: 'insideLeft', fontSize: 11 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                label={{ value: 'تست', angle: 90, position: 'insideRight', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                yAxisId="left"
                dataKey="focusMinutes"
                name="زمان تمرکز (دقیقه)"
                fill="var(--accent-primary)"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="questionsSolved"
                name="تعداد تست"
                stroke="var(--status-complete)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Category Time Distribution */}
      <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm space-y-3">
        <div>
          <h3 className="text-sm font-bold text-text-main">
            توزیع زمان تمرکز به تفکیک حوزه‌ها (ساعت)
          </h3>
          <p className="text-xs text-text-muted">
            سهم هر دسته‌بندی (تحصیلی، مهندسی هوش مصنوعی، برنامه‌نویسی و ...) از کل زمان کار عمیق
          </p>
        </div>
        <div className="h-64 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryDist} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="hours" name="مجموع ساعات" radius={[0, 4, 4, 0]}>
                {categoryDist.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || 'var(--accent-primary)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Mock Exam Taraz & Percentage Progression */}
      <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm space-y-3">
        <div>
          <h3 className="text-sm font-bold text-text-main">
            روند تراز و درصد کل در آزمون‌های آزمایشی
          </h3>
          <p className="text-xs text-text-muted">
            پایش پیشرفت تراز و میانگین وزنی درصدها در طول آزمون‌های جامع ثبت‌شده
          </p>
        </div>
        {mockExamTrend.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-text-muted">
            برای مشاهده نمودار روند تراز، اولین کارنامه آزمون آزمایشی خود را در بخش خزانه دانش ثبت کنید.
          </div>
        ) : (
          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockExamTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis
                  yAxisId="taraz"
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                />
                <YAxis
                  yAxisId="pct"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  yAxisId="taraz"
                  type="monotone"
                  dataKey="taraz"
                  name="تراز کل"
                  stroke="var(--accent-primary)"
                  strokeWidth={2.5}
                />
                <Line
                  yAxisId="pct"
                  type="monotone"
                  dataKey="percentage"
                  name="میانگین وزنی (%)"
                  stroke="var(--status-partial)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 4. Peak Focus Hours of the Day */}
      <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm space-y-3">
        <div>
          <h3 className="text-sm font-bold text-text-main">
            ساعات اوج تمرکز در شبانه‌روز (Bio-Rhythm & Peak Hours)
          </h3>
          <p className="text-xs text-text-muted">
            توزیع دقایق مطالعه بر اساس ساعت شروع جلسات در ۲۴ ساعت شبانه‌روز
          </p>
        </div>
        <div className="h-64 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="hourLabel" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar
                dataKey="minutes"
                name="مجموع دقایق تمرکز"
                fill="var(--status-complete)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
