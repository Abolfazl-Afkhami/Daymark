// src/components/settings/BackupRestoreManager.tsx
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Upload, CheckCircle2, AlertTriangle, Database } from 'lucide-react';

export function BackupRestoreManager() {
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('LOADING');
    setMessage('در حال اعتبارسنجی و بازیابی تراکنشی پایگاه‌داده...');

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'خطا در بازیابی فایل پشتیبان');
      }

      setStatus('SUCCESS');
      setMessage('تمامی اطلاعات (عادات، اهداف، آزمون‌ها و یادداشت‌ها) با موفقیت بازیابی شدند.');
      router.refresh();
    } catch (err: any) {
      setStatus('ERROR');
      setMessage(err?.message || 'فایل انتخاب‌شده معتبر نیست.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
      <div>
        <h2 className="text-base font-bold text-text-main flex items-center gap-2">
          <Database className="w-4 h-4 text-accent" />
          <span>پشتیبان‌گیری و بازیابی اطلاعات (Backup & Disaster Recovery)</span>
        </h2>
        <p className="text-xs text-text-muted mt-1">
          خروجی کامل JSON شامل عادات، استریک‌ها، اهداف، جلسات مطالعه، یادداشت‌های فنی و کارنامه‌های آزمون آزمایشی (نسخه 1.1.2)
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href="/api/backup"
          download
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white font-semibold text-xs hover:opacity-95 transition-opacity"
        >
          <Download className="w-4 h-4" />
          <span>دانلود فایل پشتیبان (Export JSON)</span>
        </a>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          disabled={status === 'LOADING'}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-elevated hover:bg-accent/15 text-text-main border border-border-subtle font-semibold text-xs transition-colors disabled:opacity-50"
        >
          <Upload className="w-4 h-4 text-accent" />
          <span>
            {status === 'LOADING' ? 'در حال بازیابی...' : 'بازیابی از فایل پشتیبان (Restore JSON)'}
          </span>
        </button>
      </div>

      {status === 'SUCCESS' && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-status-complete/15 border border-status-complete/30 text-status-complete text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {status === 'ERROR' && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-status-missed/15 border border-status-missed/30 text-status-missed text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
