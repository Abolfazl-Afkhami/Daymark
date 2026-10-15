// src/components/habits/HabitCard.tsx
'use client';

import React, { useTransition } from 'react';
import { RotateCcw } from 'lucide-react';
import { deleteHabitAction, archiveHabitAction } from '@/application/actions/delete-actions';
import { unarchiveHabitAction } from '@/application/actions/habit-actions';
import { DeleteConfirmButton } from '@/components/ui/DeleteConfirmButton';

interface HabitCardProps {
  id: string;
  name: string;
  status: string;
  habitType: string;
  categoryName: string;
  categoryColor: string;
  scheduleType?: string | null;
  targetValue?: number | null;
  targetUnit?: string | null;
}

export function HabitCard({
  id,
  name,
  status,
  habitType,
  categoryName,
  categoryColor,
  scheduleType,
  targetValue,
  targetUnit,
}: HabitCardProps) {
  const [isPending, startTransition] = useTransition();
  const isArchived = status === 'ARCHIVED';

  const handleUnarchive = () => {
    startTransition(async () => {
      await unarchiveHabitAction(id);
    });
  };

  return (
    <div
      className={`p-4 rounded-xl border shadow-sm transition-all space-y-3 ${
        isArchived
          ? 'bg-elevated/40 border-border-subtle opacity-70'
          : 'bg-surface border-border-subtle hover:border-accent/40'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-2.5 h-8 rounded-full shrink-0"
            style={{ backgroundColor: categoryColor }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-main truncate">{name}</h3>
              {isArchived && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 font-bold">
                  بایگانی‌شده
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted">{categoryName}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] px-2 py-0.5 rounded bg-elevated text-text-muted font-medium">
            {habitType === 'QUANTITATIVE' ? 'کمّی' : 'باینری'}
          </span>

          {isArchived && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleUnarchive}
              className="p-1.5 rounded-lg hover:bg-elevated text-text-muted hover:text-text-main transition-colors text-xs"
              title="فعال‌سازی مجدد عادت"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <DeleteConfirmButton
            onDelete={() => deleteHabitAction(id)}
            onArchive={!isArchived ? () => archiveHabitAction(id) : undefined}
            itemLabel={name}
            confirmText="حذف"
            archiveText="بایگانی"
            size="sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted pt-1 border-t border-border-subtle">
        <span>نوع: {scheduleType === 'WEEKDAYS' ? 'روزهای انتخابی' : 'روزانه'}</span>
        {habitType === 'QUANTITATIVE' && targetValue && (
          <span className="font-semibold text-text-main">
            هدف: {targetValue} {targetUnit || 'واحد'}
          </span>
        )}
      </div>
    </div>
  );
}
