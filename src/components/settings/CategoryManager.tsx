// src/components/settings/CategoryManager.tsx
'use client';

import React, { useState } from 'react';
import { Palette, Plus, AlertCircle, ShieldCheck } from 'lucide-react';
import { createCategoryAction } from '@/application/actions/settings-actions';
import { deleteCategoryAction } from '@/application/actions/delete-actions';
import { DeleteConfirmButton } from '@/components/ui/DeleteConfirmButton';

import { SYSTEM_CATEGORY_IDS } from '@/domain/category/constants';

interface CategoryItem {
  id: string;
  name: string;
  colorHex: string;
}

export function CategoryManager({ categories }: { categories: CategoryItem[] }) {
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setError(null);
    const res = await deleteCategoryAction(id);
    if (res && !res.success && res.error) {
      setError(res.error);
    }
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-text-main flex items-center gap-2">
          <Palette className="w-4 h-4 text-accent" />
          <span>مدیریت دسته‌بندی‌ها (حوزه‌های زندگی)</span>
        </h2>
        <span className="text-xs text-text-muted">{categories.length} حوزه فعال</span>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-status-missed/10 border border-status-missed/20 text-status-missed text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((c) => {
          const isSystem = SYSTEM_CATEGORY_IDS.has(c.id);

          return (
            <div
              key={c.id}
              className="p-3 rounded-lg border border-border-subtle bg-canvas flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: c.colorHex }}
                />
                <span className="text-sm font-medium text-text-main truncate">{c.name}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isSystem ? (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] text-text-muted px-2 py-0.5 rounded bg-elevated font-semibold border border-border-subtle"
                    title="دسته‌بندی اصلی و محافظت‌شده سیستم"
                  >
                    <ShieldCheck className="w-3 h-3 text-accent" />
                    <span>پایه سیستم</span>
                  </span>
                ) : (
                  <DeleteConfirmButton
                    onDelete={() => handleDelete(c.id)}
                    itemLabel={c.name}
                    confirmText="حذف حوزه"
                    size="sm"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Category Form */}
      <form action={createCategoryAction} className="pt-3 border-t border-border-subtle flex gap-2">
        <input
          type="text"
          name="name"
          required
          placeholder="نام حوزه یا دسته‌بندی جدید..."
          className="flex-1 px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="color"
          name="colorHex"
          defaultValue="#2563EB"
          className="w-10 h-10 rounded-lg border border-border-subtle bg-canvas cursor-pointer p-1"
          title="انتخاب رنگ حوزه"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-accent text-white font-medium text-sm hover:opacity-95 transition-opacity flex items-center gap-1 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن</span>
        </button>
      </form>
    </div>
  );
}
