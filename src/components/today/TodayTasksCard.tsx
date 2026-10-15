// src/components/today/TodayTasksCard.tsx
'use client';

import React, { useTransition } from 'react';
import { toggleTaskAction } from '@/application/actions/project-actions';
import { useI18n } from '@/lib/i18n';
import { CheckCircle2, Circle, ListTodo, AlertTriangle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export interface UrgentTaskItem {
  id: string;
  projectId: string;
  projectTitle: string;
  title: string;
  status: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate: string | null;
}

interface Props {
  tasks: UrgentTaskItem[];
}

export function TodayTasksCard({ tasks }: Props) {
  const { t, locale } = useI18n();
  const [isPending, startTransition] = useTransition();

  const handleToggle = (taskId: string, projectId: string, currentStatus: string) => {
    startTransition(async () => {
      await toggleTaskAction(taskId, projectId, currentStatus);
    });
  };

  const getPriorityBadge = (priority: UrgentTaskItem['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-rose-600 bg-rose-500/10 border-rose-500/20';
      case 'HIGH':
        return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
      case 'LOW':
        return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
      default:
        return 'text-accent bg-accent/10 border-accent/20';
    }
  };

  return (
    <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-text-main">
            {locale === 'fa' ? 'وظایف و تسک‌های اولویت‌دار امروز' : "Today's Priority Tasks"}
          </h3>
        </div>
        <Link
          href="/projects"
          className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
        >
          <span>{locale === 'fa' ? 'مشاهده پروژه‌ها' : 'View Projects'}</span>
          <ArrowUpRight className="w-3.5 h-3.5 rtl:rotate-90" />
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="p-4 rounded-lg bg-elevated/40 border border-dashed border-border-subtle text-center">
          <p className="text-xs text-text-muted">
            {locale === 'fa'
              ? 'تسک دارای سررسید یا فوری برای امروز وجود ندارد.'
              : 'No urgent tasks or deadlines due today.'}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-60 overflow-y-auto pe-1">
          {tasks.map((task) => {
            const isDone = task.status === 'DONE';
            return (
              <div
                key={task.id}
                className={`flex items-center justify-between gap-2 p-2.5 rounded-lg border transition-all ${
                  isDone
                    ? 'bg-status-complete/5 border-status-complete/20 opacity-70'
                    : 'bg-surface border-border-subtle hover:border-accent/30'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleToggle(task.id, task.projectId, task.status)}
                    className="shrink-0 text-text-muted hover:text-accent transition-colors"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-status-complete" />
                    ) : (
                      <Circle className="w-4 h-4 text-text-muted" />
                    )}
                  </button>
                  <div className="truncate">
                    <span
                      className={`text-xs font-medium block truncate ${
                        isDone ? 'line-through text-text-muted' : 'text-text-main font-semibold'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="text-[10px] text-text-muted truncate block">
                      {task.projectTitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getPriorityBadge(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
