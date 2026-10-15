// src/components/study/SpacedRepetitionDeck.tsx
'use client';

import React, { useState, useTransition } from 'react';
import {
  createReviewItemAction,
  submitReviewQualityAction,
  createReviewAction,
  gradeReviewAction,
} from '@/application/actions/study-actions';
import { deleteStudyReviewAction } from '@/application/actions/delete-actions';
import { DeleteConfirmButton } from '@/components/ui/DeleteConfirmButton';
import { BrainCircuit, Plus, Sparkles, CheckCircle2 } from 'lucide-react';

export interface ReviewItem {
  id: string;
  title: string;
  area_id?: string | null;
  repetition_count: number;
  ease_factor: number;
  interval_days: number;
  next_review_date: string;
}

interface Props {
  dueReviews?: ReviewItem[];
  items?: ReviewItem[];
  todayCivilDate?: string;
}

export function SpacedRepetitionDeck({ dueReviews, items, todayCivilDate }: Props) {
  const reviews = dueReviews ?? items ?? [];
  const [newTitle, setNewTitle] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const title = newTitle.trim();
    setNewTitle('');
    startTransition(async () => {
      if (todayCivilDate) {
        await createReviewAction(title, todayCivilDate, 'cat_academic');
      } else {
        await createReviewItemAction({ title, areaId: 'cat_academic' });
      }
    });
  };

  const handleGrade = (id: string, quality: 1 | 3 | 5) => {
    startTransition(async () => {
      if (todayCivilDate) {
        await gradeReviewAction(id, quality, todayCivilDate);
      } else {
        await submitReviewQualityAction(id, quality);
      }
    });
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-accent/10 text-accent shrink-0 mt-0.5">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-main leading-snug">
              مرورهای هوشمند امروز (الگوریتم SM-2)
            </h2>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              مباحث تحصیلی و مفاهیم مهندسی که طبق منحنی فراموشی موعد تثبیت آن‌هاست
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-accent/15 text-accent border border-accent/30 text-xs font-bold whitespace-nowrap shrink-0 tabular-nums">
          {reviews.length} مورد فعال
        </span>
      </div>

      {/* Add New Review Topic Form */}
      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="افزودن مبحث جدید به چرخه مرور..."
          className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-border-subtle bg-canvas text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={isPending || !newTitle.trim()}
          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-accent text-white text-xs font-bold whitespace-nowrap shrink-0 hover:opacity-95 transition-opacity disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>ثبت مبحث</span>
        </button>
      </form>

      {/* Due Review Cards List */}
      {reviews.length === 0 ? (
        <div className="py-6 px-4 rounded-xl bg-elevated/40 border border-border-subtle text-center space-y-1.5">
          <CheckCircle2 className="w-6 h-6 text-status-complete mx-auto" />
          <div className="text-xs font-bold text-text-main">
            تمام مرورهای سررسید شده امروز تکمیل شده‌اند!
          </div>
          <p className="text-[11px] text-text-muted">
            مباحث جدید را از کادر بالا اضافه کنید تا در بازه‌های بهینه یادآوری شوند.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-canvas/70 border border-border-subtle hover:border-accent/40 transition-colors space-y-3"
            >
              {/* Top Row: Title + Metadata Badges + Delete Button */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="text-sm font-bold text-text-main truncate">
                      {item.title}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-text-muted tabular-nums">
                    <span className="px-2 py-0.5 rounded-md bg-elevated border border-border-subtle whitespace-nowrap">
                      مرور #{item.repetition_count}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-elevated border border-border-subtle whitespace-nowrap">
                      بازه فعلی: {item.interval_days} روز
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-elevated border border-border-subtle whitespace-nowrap">
                      ضریب آسانی: {Number(item.ease_factor).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <DeleteConfirmButton
                    itemLabel={item.title}
                    onDelete={() => deleteStudyReviewAction(item.id)}
                  />
                </div>
              </div>

              {/* Bottom Row: 3 Equal-Width Rating Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border-subtle/60">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleGrade(item.id, 1)}
                  className="py-1.5 px-2 rounded-lg bg-status-missed/15 hover:bg-status-missed hover:text-white text-status-missed border border-status-missed/30 text-[11px] font-bold transition-colors text-center whitespace-nowrap"
                >
                  فراموشی (۱ روز)
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleGrade(item.id, 3)}
                  className="py-1.5 px-2 rounded-lg bg-status-partial/15 hover:bg-status-partial hover:text-white text-status-partial border border-status-partial/30 text-[11px] font-bold transition-colors text-center whitespace-nowrap"
                >
                  متوسط
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleGrade(item.id, 5)}
                  className="py-1.5 px-2 rounded-lg bg-status-complete/15 hover:bg-status-complete hover:text-white text-status-complete border border-status-complete/30 text-[11px] font-bold transition-colors text-center whitespace-nowrap"
                >
                  مسلط
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
