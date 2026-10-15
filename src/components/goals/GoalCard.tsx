'use client';

import { useState, useTransition } from 'react';
import { Target, CheckCircle2, Plus, Edit3, X, Calendar, Layers, ChevronDown } from 'lucide-react';
import { updateGoalProgressAction, setGoalExactValueAction } from '@/application/actions/goal-actions';
import { deleteGoalAction } from '@/application/actions/delete-actions';
import { DeleteConfirmButton } from '@/components/ui/DeleteConfirmButton';

interface GoalCardProps {
  id: string;
  title: string;
  categoryName: string;
  colorHex: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: string;
  progressSource?: string;
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
  progressSource = 'MANUAL',
  deadlineDate,
}: GoalCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customDelta, setCustomDelta] = useState<string>('');
  const [mode, setMode] = useState<'add' | 'set'>('add');

  const percentage = Math.min(100, Math.round((currentValue / targetValue) * 100));
  const isCompleted = status === 'COMPLETED' || currentValue >= targetValue;

  // انتخاب هوشمند دکمه‌های مقداری سریع بر اساس واحد هدف
  const getQuickPills = () => {
    const u = unit.toLowerCase();
    if (u.includes('تست') || u.includes('سوال') || u.includes('مسئله') || targetValue >= 200) {
      return [10, 25, 50, 100];
    }
    if (u.includes('ساعت') || u.includes('hour')) {
      return [0.5, 1, 2, 4];
    }
    if (u.includes('صفحه') || u.includes('page') || u.includes('فصل') || u.includes('درس')) {
      return [1, 5, 10, 20];
    }
    return [1, 5, 10];
  };

  const quickPills = getQuickPills();

  const handleQuickAdd = (delta: number) => {
    startTransition(async () => {
      await updateGoalProgressAction(id, delta);
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customDelta);
    if (isNaN(val) || val === 0) return;

    startTransition(async () => {
      if (mode === 'add') {
        await updateGoalProgressAction(id, val);
      } else {
        await setGoalExactValueAction(id, val);
      }
      setIsCustomOpen(false);
      setCustomDelta('');
    });
  };

  // ترجمه منبع پیشرفت
  const getSourceLabel = () => {
    switch (progressSource) {
      case 'SESSION_QUESTIONS':
        return 'همگام با تعداد تست‌های حل‌شده در تمرکز';
      case 'SESSION_DURATION':
        return 'همگام با مجموع ساعات مطالعه در تمرکز';
      case 'HABIT_SUM':
        return 'همگام با تجمیع ثبت عادات روزانه';
      case 'PROJECT_TASKS':
        return 'همگام با انجام تسک‌های پروژه';
      case 'MANUAL':
      default:
        return 'ورود مستقیم و دستی';
    }
  };

  return (
    <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-sm space-y-3.5 hover:border-accent/30 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <span
            className="w-2.5 h-9 rounded-full shrink-0 mt-0.5"
            style={{ backgroundColor: colorHex }}
          />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-text-main truncate" title={title}>
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-text-muted">{categoryName}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-elevated text-text-muted flex items-center gap-1">
                <Layers className="w-2.5 h-2.5" />
                <span>{getSourceLabel()}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 ${
              isCompleted
                ? 'bg-status-complete/15 text-status-complete border border-status-complete/20'
                : 'bg-elevated text-text-muted border border-border-subtle'
            }`}
          >
            {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
            {isCompleted ? 'تکمیل شد' : `${percentage}%`}
          </span>

          <DeleteConfirmButton
            onDelete={() => deleteGoalAction(id)}
            itemLabel={title}
            confirmText="حذف هدف"
            size="sm"
          />
        </div>
      </div>

      {/* Progress Bar & Value Display */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-baseline text-xs">
          <span className="font-semibold text-text-main">
            {currentValue.toLocaleString('fa-IR')} <span className="text-text-muted font-normal">از</span> {targetValue.toLocaleString('fa-IR')} <span className="text-text-muted font-normal">{unit}</span>
          </span>
          {deadlineDate && (
            <span className="text-[11px] text-text-muted flex items-center gap-1">
              <Calendar className="w-3 h-3 text-accent" />
              <span>مهلت: {deadlineDate}</span>
            </span>
          )}
        </div>
        <div className="w-full h-2.5 bg-elevated rounded-full overflow-hidden border border-border-subtle/50">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted ? 'bg-status-complete' : 'bg-accent'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Quick Increment & Custom Batch Actions */}
      <div className="pt-1 space-y-2 border-t border-border-subtle/40">
        <div className="flex items-center justify-between flex-wrap gap-1.5">
          {/* Quick Increment Pills */}
          <div className="flex items-center gap-1">
            {quickPills.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleQuickAdd(amt)}
                disabled={isPending}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-elevated hover:bg-accent/15 hover:text-accent text-text-muted transition-colors disabled:opacity-40"
                title={`افزودن ${amt} ${unit}`}
              >
                +{amt}
              </button>
            ))}
          </div>

          {/* Toggle Custom Batch Input */}
          <button
            type="button"
            onClick={() => setIsCustomOpen(!isCustomOpen)}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-elevated hover:bg-accent/10 hover:text-accent text-text-main font-semibold transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>ثبت دلخواه / دسته‌ای</span>
          </button>
        </div>

        {/* Custom Batch Form */}
        {isCustomOpen && (
          <form
            onSubmit={handleCustomSubmit}
            className="p-2.5 rounded-lg bg-elevated border border-border-subtle space-y-2 text-xs animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode('add')}
                  className={`px-2 py-0.5 rounded font-medium ${
                    mode === 'add' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  افزودن به پیشرفت (+)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('set')}
                  className={`px-2 py-0.5 rounded font-medium ${
                    mode === 'set' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  تنظیم مقدار کل (=)
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomOpen(false)}
                className="text-text-muted hover:text-text-main p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                required
                value={customDelta}
                onChange={(e) => setCustomDelta(e.target.value)}
                placeholder={mode === 'add' ? `مقدار افزایشی (مثلاً ۵۰ یا ۱۶۰)...` : `مقدار دقیق فعلی...`}
                className="flex-1 px-2.5 py-1.5 rounded border border-border-subtle bg-surface text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                autoFocus
              />
              <button
                type="submit"
                disabled={isPending || !customDelta}
                className="px-3 py-1.5 rounded bg-accent text-white font-semibold text-xs hover:opacity-95 disabled:opacity-50 transition-opacity"
              >
                {isPending ? 'در حال ثبت...' : 'ثبت'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
