import { db } from '@/db/client';
import { appPreferences, categories } from '@/db/schema';
import { updatePreferencesAction } from '@/application/actions/settings-actions';
import { Palette, Globe } from 'lucide-react';
import { ThemeSelector } from '@/components/settings/ThemeSelector';
import { BackupRestoreManager } from '@/components/settings/BackupRestoreManager';
import { CategoryManager } from '@/components/settings/CategoryManager';
import { getDictionary, Locale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const prefs = (await db.query.appPreferences.findFirst()) || {
    uiLocale: 'fa',
    calendarSystem: 'persian',
    dayRolloverHour: 4,
    theme: 'system',
  };

  const currentLocale = (prefs.uiLocale || 'fa') as Locale;
  const t = getDictionary(currentLocale);

  const allCategories = await db.select().from(categories).all();

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.settings.title}</h1>
        <p className="text-sm text-text-muted mt-0.5">
          {t.settings.subtitle}
        </p>
      </div>

      {/* Theme & Appearance Section */}
      <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-text-main flex items-center gap-2">
            <Palette className="w-4 h-4 text-accent" />
            <span>{t.settings.themeTitle}</span>
          </h2>
          <p className="text-xs text-text-muted mt-1">
            {t.settings.themeSubtitle}
          </p>
        </div>

        <ThemeSelector currentTheme={prefs.theme} />
      </div>

      {/* Preferences Form */}
      <form action={updatePreferencesAction} className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-text-main flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent" />
          <span>{t.settings.generalSettings}</span>
        </h2>

        {/* Keep hidden theme input to maintain current preference on form save */}
        <input type="hidden" name="theme" value={prefs.theme} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">{t.settings.languageLabel}</label>
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
            <label className="text-xs font-semibold text-text-main">{t.settings.calendarLabel}</label>
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
              {t.settings.rolloverLabel}
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
              {t.settings.rolloverDesc}
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-accent text-white font-semibold text-sm hover:opacity-95 transition-opacity"
          >
            {t.settings.saveSettings}
          </button>
        </div>
      </form>

      {/* Category Management */}
      <CategoryManager categories={allCategories.map((c) => ({ id: c.id, name: c.name, colorHex: c.colorHex }))} />

      {/* Data Backup & Disaster Recovery */}
      <BackupRestoreManager />
    </div>
  );
}
