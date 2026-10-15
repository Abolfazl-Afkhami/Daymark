// src/components/today/QuickLaunchpad.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Timer, BookOpen, FileSpreadsheet, Lightbulb, Target } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function QuickLaunchpad() {
  const { t, locale } = useI18n();

  const launchActions = [
    {
      href: '/focus',
      label: t.today.quickFocus,
      desc: locale === 'fa' ? 'شروع تایمر عمیق پومودورو' : 'Start deep focus timer',
      icon: Timer,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40',
    },
    {
      href: '/vault?tab=practice',
      label: t.today.quickPractice,
      desc: locale === 'fa' ? 'ثبت تست‌های حل‌شده مبحثی' : 'Log topic question set',
      icon: BookOpen,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:border-blue-500/40',
    },
    {
      href: '/vault?tab=exams',
      label: locale === 'fa' ? 'ثبت کارنامه آزمون' : 'Mock Exam Report',
      desc: locale === 'fa' ? 'تراز، درصد و رتبه آزمون' : 'Percent, taraz & rank',
      icon: FileSpreadsheet,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:border-purple-500/40',
    },
    {
      href: '/vault?tab=notes',
      label: t.today.quickNote,
      desc: locale === 'fa' ? 'یادداشت فرمول یا نکته کلیدی' : 'Formulas & TIL note',
      icon: Lightbulb,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:border-amber-500/40',
    },
    {
      href: '/goals',
      label: t.today.quickGoals,
      desc: locale === 'fa' ? 'پایش اهداف متصل به زمان و تست' : 'Track time & test goals',
      icon: Target,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:border-rose-500/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {launchActions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className={`p-3 rounded-xl border bg-surface transition-all flex flex-col justify-between group shadow-xs hover:shadow-md hover:-translate-y-0.5 ${action.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-lg bg-surface/80 border border-border-subtle group-hover:scale-105 transition-transform">
                <Icon className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2.5">
              <h4 className="text-xs font-bold text-text-main group-hover:text-accent transition-colors truncate">
                {action.label}
              </h4>
              <p className="text-[10px] text-text-muted truncate mt-0.5">
                {action.desc}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
