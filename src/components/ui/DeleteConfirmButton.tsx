// src/components/ui/DeleteConfirmButton.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { Trash2, Archive, Check, X } from 'lucide-react';

interface Props {
  onDelete: () => Promise<any>;
  onArchive?: () => Promise<any>;
  itemLabel?: string;
  confirmText?: string;
  archiveText?: string;
  size?: 'sm' | 'md';
}

export function DeleteConfirmButton({
  onDelete,
  onArchive,
  itemLabel = 'این مورد',
  confirmText = 'حذف',
  archiveText = 'بایگانی',
  size = 'sm',
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      await onDelete();
      setConfirming(false);
    });
  };

  const handleConfirmArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onArchive) return;
    startTransition(async () => {
      await onArchive();
      setConfirming(false);
    });
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setConfirming(true);
        }}
        className={`inline-flex items-center justify-center rounded-lg text-text-muted hover:text-status-missed hover:bg-status-missed/10 transition-colors ${
          size === 'sm' ? 'p-1.5' : 'p-2'
        }`}
        title={`حذف ${itemLabel}`}
        aria-label={`حذف ${itemLabel}`}
      >
        <Trash2 className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      </button>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 bg-elevated border border-border-subtle rounded-lg p-1 shadow-xs animate-in fade-in duration-150"
    >
      {onArchive && (
        <button
          type="button"
          disabled={isPending}
          onClick={handleConfirmArchive}
          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface hover:bg-accent hover:text-white text-text-main text-[11px] font-semibold transition-colors border border-border-subtle"
          title="بایگانی کردن (حفظ تاریخچه آماری)"
        >
          <Archive className="w-3 h-3" />
          <span>{archiveText}</span>
        </button>
      )}

      <button
        type="button"
        disabled={isPending}
        onClick={handleConfirmDelete}
        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-status-missed text-white text-[11px] font-bold hover:opacity-90 transition-opacity"
        title="حذف کامل"
      >
        <Check className="w-3 h-3" />
        <span>{isPending ? '...' : confirmText}</span>
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={(e) => {
          e.stopPropagation();
          setConfirming(false);
        }}
        className="p-1 rounded text-text-muted hover:text-text-main hover:bg-surface"
        title="انصراف"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
