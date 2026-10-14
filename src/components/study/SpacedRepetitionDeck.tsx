// src/components/study/SpacedRepetitionDeck.tsx
'use client';

import { useTransition, useState } from 'react';
import {
  gradeReviewAction,
  createReviewAction,
  deleteReviewAction,
} from '@/application/actions/study-actions';
import { ReviewQuality } from '@/domain/study/study-engine';
import { BrainCircuit, Plus, Sparkles, CheckCircle, Trash2, RotateCcw } from 'lucide-react';

export interface ReviewItem {
  id: string;
  title: string;
  repetition_count: number;
  ease_factor: number;
  interval_days: number;
  next_review_date: string;
}

export function SpacedRepetitionDeck({
  items,
  todayCivilDate,
}: {
  items: ReviewItem[];
  todayCivilDate: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [newTitle, setNewTitle] = useState('');

  const handleGrade = (id: string, quality: ReviewQuality) => {
    startTransition(async () => {
      await gradeReviewAction(id, quality, todayCivilDate);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteReviewAction(id);
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const titleToAdd = newTitle;
    setNewTitle('');
    startTransition(async () => {
      await createReviewAction(titleToAdd, todayCivilDate);
    });
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-main">
              مرورهای هوشمند امروز (الگوریتم SM-2)
            </h3>
            <p className="text-xs text-text-muted">
              مباحث تحصیلی و مفاهیم مهندسی که طبق منحنی فراموشی موعد تثبیت آن‌هاست
            </p>
          </div>
        </div>
        <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent border border-accent/20">
          {items.length} مورد فعال
        </span>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="افزودن مبحث جدید به چرخه مرور (مثلاً: مشتق ضمنی، Rust Lifetimes یا Docker Volumes)..."
          className="flex-1 rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-sm text-text-main placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
        />
        <button
          type="submit"
          disabled={isPending || !newTitle.trim()}
          className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50 transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ثبت مبحث</span>
        </button>
      </form>

      {/* Cards List or Empty State */}
      {items.length === 0 ? (
        <div className="py-6 px-4 rounded-xl bg-canvas border border-dashed border-border-subtle text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-status-complete/10 text-status-complete mx-auto flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-text-main">
            عالیه! تمام مرورهای برنامه‌ریزی‌شده تا امروز تکمیل شده‌اند.
          </p>
          <p className="text-xs text-text-muted">
            هر نکته، فرمول یا مفهوم جدیدی که یاد می‌گیرید را برای تثبیت در حافظه بلندمدت ثبت کنید.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border-subtle bg-canvas p-3.5 hover:border-accent/40 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
                  <p className="text-sm font-semibold text-text-main">{item.title}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span>مرور #{item.repetition_count + 1}</span>
                  <span>•</span>
                  <span>بازه فعلی: {item.interval_days} روز</span>
                  <span>•</span>
                  <span>ضریب آسانی: {item.ease_factor}</span>
                </div>
              </div>

              {/* Action Grading Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleGrade(item.id, 1)}
                  disabled={isPending}
                  className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-xs font-medium text-rose-500 hover:bg-rose-500/20 disabled:opacity-50 transition-colors"
                  title="فراموش کرده بودم (بازگشت به روز اول)"
                >
                  فراموشی (۱ روز)
                </button>
                <button
                  type="button"
                  onClick={() => handleGrade(item.id, 3)}
                  disabled={isPending}
                  className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-500 hover:bg-amber-500/20 disabled:opacity-50 transition-colors"
                  title="به یاد آوردم اما با چالش و مکث"
                >
                  متوسط
                </button>
                <button
                  type="button"
                  onClick={() => handleGrade(item.id, 5)}
                  disabled={isPending}
                  className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-500 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
                  title="تسلط کامل و آسان"
                >
                  مسلط
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={isPending}
                  className="p-1 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="حذف از چرخه مرور"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
