// src/components/focus/SessionRow.tsx
'use client';

import React from 'react';
import { deleteStudySessionAction } from '@/application/actions/delete-actions';
import { DeleteConfirmButton } from '@/components/ui/DeleteConfirmButton';

interface SessionRowProps {
  id: string;
  categoryName: string;
  categoryColor: string;
  subjectTag: string | null;
  sessionType: string;
  sessionDate: string;
  durationMinutes: number;
  questionsCompleted: number | null;
}

export function SessionRow({
  id,
  categoryName,
  categoryColor,
  subjectTag,
  sessionType,
  sessionDate,
  durationMinutes,
  questionsCompleted,
}: SessionRowProps) {
  return (
    <div className="py-3 flex items-center justify-between group">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="w-2.5 h-6 rounded-full shrink-0"
          style={{ backgroundColor: categoryColor }}
        />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-text-main truncate">
            {subjectTag || sessionType}
          </div>
          <div className="text-xs text-text-muted">
            {sessionDate} • {categoryName}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-end">
          <span className="text-sm font-bold text-accent font-mono tabular-nums">
            {durationMinutes} دقیقه
          </span>
          {questionsCompleted !== null && questionsCompleted > 0 && (
            <div className="text-xs text-text-muted tabular-nums">
              {questionsCompleted} تست حل‌شده
            </div>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DeleteConfirmButton
            onDelete={() => deleteStudySessionAction(id)}
            itemLabel="جلسه مطالعه"
            confirmText="حذف"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
