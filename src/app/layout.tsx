// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { sqlite } from '@/db/client';
import { I18nProvider } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Daymark | داشبورد مدیریت عادت و مطالعه',
  description: 'Personal Habit Tracking, Study & Engineering Productivity Dashboard',
};

interface AppPrefsRow {
  ui_locale: 'en' | 'fa';
  calendar_system: 'gregorian' | 'persian';
  numeral_system: 'latn' | 'arabext';
  theme: 'light' | 'dark' | 'sepia' | 'oled' | 'system';
}

function getAppPreferences(): AppPrefsRow {
  try {
    const row = sqlite
      .prepare('SELECT ui_locale, calendar_system, numeral_system, theme FROM app_preferences WHERE id = 1')
      .get() as AppPrefsRow | undefined;
    if (row) return row;
  } catch {
    // Fallback if table is initializing
  }
  return {
    ui_locale: 'fa',
    calendar_system: 'persian',
    numeral_system: 'arabext',
    theme: 'system',
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const prefs = getAppPreferences();
  const isRtl = prefs.ui_locale === 'fa';
  const isDarkClass = prefs.theme === 'dark' || prefs.theme === 'oled';

  // اسکریپت مسدودکننده Zero-FOUC برای اعمال آنی تم (به‌خصوص در حالت system)
  const themeInitScript = `
    (function() {
      try {
        var serverTheme = ${JSON.stringify(prefs.theme)};
        var saved = localStorage.getItem('daymark_theme') || serverTheme;
        var resolved = saved;
        if (saved === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        var root = document.documentElement;
        root.setAttribute('data-theme', resolved);
        if (resolved === 'dark' || resolved === 'oled') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      } catch (e) {}
    })();
  `;

  return (
    <html
      lang={prefs.ui_locale}
      dir={isRtl ? 'rtl' : 'ltr'}
      data-theme={prefs.theme === 'system' ? 'light' : prefs.theme}
      data-calendar={prefs.calendar_system}
      data-locale={prefs.ui_locale}
      className={isDarkClass ? 'dark' : ''}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/aminabedi68/Estedad@master/dist/Estedad-font-face.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Round-Dots/Vazirmatn-RD-font-face.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-canvas text-text-main font-sans antialiased selection:bg-accent/20 selection:text-accent">
        <I18nProvider locale={prefs.ui_locale}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
