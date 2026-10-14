import { db } from '@/db/client';
import { appPreferences, categories } from '@/db/schema';
import { updatePreferencesAction, createCategoryAction } from '@/application/actions/settings-actions';
import { Settings, Plus, Download, Palette, Globe, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const prefs = await db.query.appPreferences.findFirst() || {
    uiLocale: 'fa',
    calendarSystem: 'persian',
    dayRolloverHour: 4,
    theme: 'system',
  };

  const allCategories = await db.select().from(categories).all();

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">تنظیمات و پیکربندی (Settings)</h1>
        <p className="text-sm text-text-muted mt-0.5">
          مدیریت زبان، تقویم، ساعت جابجایی شبانه، دسته‌بندی‌ها و پشتیبان‌گیری داده‌ها
        </p>
      </div>

      {/* Preferences Form */}
      <form action={updatePreferencesAction} className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-text-main flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent" />
          <span>تنظیمات زبان و تقویم</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">زبان رابط کاربری</label>
            <select
              name="uiLocale"
              defaultValue={prefs.uiLocale}
              className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="fa">فارسی (راست‌چین RTL)</option>
              <option value="en">English (LTR)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">سیستم تقویم پیش‌فرض</label>
            <select
              name="calendarSystem"
              defaultValue={prefs.calendarSystem}
              className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="persian">شمسی (خورشیدی / جلالی)</option>
              <option value="gregorian">میلادی (Gregorian)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">
              ساعت جابجایی روز (Rollover Hour)
            </label>
            <input
              type="number"
              name="dayRolloverHour"
              min="0"
              max="6"
              defaultValue={prefs.dayRolloverHour}
              className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-[11px] text-text-muted">
              فعالیت‌های قبل از این ساعت جزو روز قبل شمرده می‌شوند (مناسب شب‌زنده‌داری بدون سوختن استریک).
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">پوسته (Theme)</label>
            <select
              name="theme"
              defaultValue={prefs.theme}
              className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="system">پیروی از تم سیستم</option>
              <option value="light">روشن (Light)</option>
              <option value="dark">تاریک (Dark)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-accent text-white font-semibold text-sm hover:opacity-95 transition-opacity"
          >
            ذخیره تنظیمات
          </button>
        </div>
      </form>

      {/* Category Management */}
      <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-text-main flex items-center gap-2">
          <Palette className="w-4 h-4 text-accent" />
          <span>مدیریت دسته‌بندی‌ها (حوزه‌های زندگی)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allCategories.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-lg border border-border-subtle bg-canvas flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.colorHex }} />
                <span className="text-sm font-medium text-text-main">{c.name}</span>
              </div>
              <span className="text-xs text-text-muted">سفارشی</span>
            </div>
          ))}
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
            defaultValue="#3B82F6"
            className="w-10 h-10 p-1 rounded-lg border border-border-subtle bg-canvas cursor-pointer shrink-0"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-accent text-white font-semibold text-xs hover:opacity-95 transition-opacity flex items-center gap-1 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن</span>
          </button>
        </form>
      </div>

      {/* Data Backup & Export */}
      <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-text-main flex items-center gap-2">
          <Download className="w-4 h-4 text-accent" />
          <span>پشتیبان‌گیری از داده‌ها (Backup & Recovery)</span>
        </h2>
        <p className="text-xs text-text-muted">
          داده‌های شما به‌صورت تک‌فایل در دیتابیس لوکال SQLite ذخیره می‌شوند. می‌توانید نسخه پشتیبان JSON از تمام موجودیت‌ها را بارگیری کنید.
        </p>
        <div className="pt-2">
          <a
            href="/api/backup"
            download="daymark-backup.json"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-elevated hover:bg-accent/10 hover:text-accent font-semibold text-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>دانلود فایل پشتیبان (Export JSON)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
