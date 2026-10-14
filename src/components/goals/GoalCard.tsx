'use client';

import { Target, CheckCircle2, Plus } from 'lucide-react';
import { updateGoalProgressAction } from '@/application/actions/goal-actions';
import { useTransition } from 'react';

interface GoalCardProps {
  id: string;
  title: string;
  categoryName: string;
  colorHex: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: string;
  deadlineDate?: string | null;
}

export function GoalCard({
  id,
  title,
  categoryName,
  colorHex,
  targetValue,
  currentValue,
  unit,
  status,
  deadlineDate,
}: GoalCardProps) {
  const [isPending, startTransition] = useTransition();

  const percentage = Math.min(100, Math.round((currentValue / targetValue) * 100));

  const handleQuickAdd = () => {
    startTransition(async () => {
      await updateGoalProgressAction(id, 1);
    });
  };

  return (
    <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-sm space-y-3 hover:border-accent/30 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-8 rounded-full shrink-0" style={{ backgroundColor: colorHex }} />
          <div>
            <h3 className="text-sm font-bold text-text-main">{title}</h3>
            <p className="text-xs text-text-muted">{categoryName}</p>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded font-medium ${
            status === 'COMPLETED'
              ? 'bg-status-complete/10 text-status-complete'
              : 'bg-elevated text-text-muted'
          }`}
        >
          {status === 'COMPLETED' ? 'تکمیل شده' : `${percentage}%`}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-text-muted">
          <span>
            {currentValue} از {targetValue} {unit}
          </span>
          {deadlineDate && <span>مهلت: {deadlineDate}</span>}
        </div>
        <div className="w-full h-2 bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {status !== 'COMPLETED' && (
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isPending}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-elevated hover:bg-accent/10 hover:text-accent font-semibold transition-colors disabled:opacity-50"
          >
            <Plus className="w-3 h-3" />
            <span>ثبت پیشرفت (۱+)</span>
          </button>
        </div>
      )}
    </div>
  );
}
