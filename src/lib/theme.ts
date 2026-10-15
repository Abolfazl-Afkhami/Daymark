// src/lib/theme.ts
export type ThemeMode = 'light' | 'dark' | 'sepia' | 'oled' | 'system';

export function applyThemeImmediately(mode: ThemeMode) {
  if (typeof window === 'undefined') return;

  localStorage.setItem('daymark_theme', mode);

  const resolved =
    mode === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : mode;

  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);

  if (resolved === 'dark' || resolved === 'oled') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
