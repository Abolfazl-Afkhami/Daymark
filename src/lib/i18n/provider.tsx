'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Dictionary, Locale } from './types';
import { fa } from './fa';
import { en } from './en';

interface I18nContextType {
  locale: Locale;
  t: Dictionary;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'fa',
  t: fa,
  isRtl: true,
});

export function I18nProvider({
  locale = 'fa',
  children,
}: {
  locale?: Locale;
  children: React.ReactNode;
}) {
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale);

  useEffect(() => {
    // Sync with html data-locale if client-side updates occur
    const rootLocale = document.documentElement.getAttribute('data-locale') as Locale;
    if (rootLocale && (rootLocale === 'fa' || rootLocale === 'en')) {
      setCurrentLocale(rootLocale);
    }
  }, [locale]);

  const dict = currentLocale === 'en' ? en : fa;

  return (
    <I18nContext.Provider
      value={{
        locale: currentLocale,
        t: dict,
        isRtl: currentLocale === 'fa',
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  return context;
}
