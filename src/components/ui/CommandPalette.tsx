// src/components/ui/CommandPalette.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { applyThemeImmediately, ThemeMode } from '@/lib/theme';
import { updateThemeAction } from '@/application/actions/settings-actions';
import {
  Search,
  Calendar,
  CheckSquare,
  Timer,
  BookOpen,
  Target,
  FolderKanban,
  BarChart3,
  Settings,
  Sun,
  Moon,
  Book,
  Sparkles,
  Monitor,
  Keyboard,
  ArrowLeft,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'NAVIGATION' | 'THEME';
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleThemeSwitch = (mode: ThemeMode) => {
    applyThemeImmediately(mode);
    updateThemeAction(mode).catch(() => {});
    setOpen(false);
  };

  const navigateTo = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  const commands: CommandItem[] = [
    {
      id: 'nav-today',
      title: 'میز کار امروز (Today)',
      subtitle: 'عادت‌های امروز، مرورهای سررسید شده و خلاصه وضعیت',
      category: 'NAVIGATION',
      icon: <Calendar className="w-4 h-4 text-accent" />,
      action: () => navigateTo('/today'),
    },
    {
      id: 'nav-focus',
      title: 'تایمر تمرکز و ثبت مطالعه (Focus)',
      subtitle: 'شروع جلسه پومودورو، نویز قهوه‌ای و ثبت ساعت مطالعه',
      category: 'NAVIGATION',
      icon: <Timer className="w-4 h-4 text-status-complete" />,
      action: () => navigateTo('/focus'),
    },
    {
      id: 'nav-vault',
      title: 'خزانه دانش و آزمون‌های آزمایشی (Vault)',
      subtitle: 'ثبت کارنامه آزمون، تست‌زنی روزانه، فلش‌کارت SM-2 و جزوات',
      category: 'NAVIGATION',
      icon: <BookOpen className="w-4 h-4 text-status-partial" />,
      action: () => navigateTo('/vault'),
    },
    {
      id: 'nav-goals',
      title: 'اهداف کمی و بلندمدت (Goals)',
      subtitle: 'مدیریت اهداف تستی، ساعتی و ثبت پیشرفت دسته‌ای',
      category: 'NAVIGATION',
      icon: <Target className="w-4 h-4 text-accent" />,
      action: () => navigateTo('/goals'),
    },
    {
      id: 'nav-habits',
      title: 'مدیریت عادت‌ها (Habits)',
      subtitle: 'برنامه‌ریزی عادت‌های روزانه، هفتگی و استریک‌ها',
      category: 'NAVIGATION',
      icon: <CheckSquare className="w-4 h-4 text-status-complete" />,
      action: () => navigateTo('/habits'),
    },
    {
      id: 'nav-projects',
      title: 'پروژه‌ها و تسک‌ها (Projects)',
      subtitle: 'مدیریت تسک‌های مهندسی و درسی دو سطحی',
      category: 'NAVIGATION',
      icon: <FolderKanban className="w-4 h-4 text-accent" />,
      action: () => navigateTo('/projects'),
    },
    {
      id: 'nav-analytics',
      title: 'داشبورد تحلیل و نمودارها (Analytics)',
      subtitle: 'نمودار روند تراز، ساعات اوج تمرکز و پیش‌بینی اتمام اهداف',
      category: 'NAVIGATION',
      icon: <BarChart3 className="w-4 h-4 text-accent" />,
      action: () => navigateTo('/analytics'),
    },
    {
      id: 'nav-settings',
      title: 'تنظیمات و پشتیبان‌گیری (Settings)',
      subtitle: 'مدیریت دسته‌بندی‌ها، تقویم، زبان و فایل دیتابیس',
      category: 'NAVIGATION',
      icon: <Settings className="w-4 h-4 text-text-muted" />,
      action: () => navigateTo('/settings'),
    },
    // Theme Commands
    {
      id: 'theme-light',
      title: 'تغییر پوسته به: روشن (Light Mode)',
      subtitle: 'زمینه سفید استاندارد با کنتراست بالا برای روز',
      category: 'THEME',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      action: () => handleThemeSwitch('light'),
    },
    {
      id: 'theme-dark',
      title: 'تغییر پوسته به: تاریک (Slate Dark)',
      subtitle: 'زمینه سرمه‌ای تیره استاندارد برای کاهش خستگی چشم',
      category: 'THEME',
      icon: <Moon className="w-4 h-4 text-blue-400" />,
      action: () => handleThemeSwitch('dark'),
    },
    {
      id: 'theme-sepia',
      title: 'تغییر پوسته به: سپیا / مطالعه (Sepia Reading)',
      subtitle: 'رنگ گرم کاغذ کاهی ویژه مطالعه طولانی‌مدت و تست‌زنی',
      category: 'THEME',
      icon: <Book className="w-4 h-4 text-amber-700" />,
      action: () => handleThemeSwitch('sepia'),
    },
    {
      id: 'theme-oled',
      title: 'تغییر پوسته به: سیاه خالص (Midnight OLED)',
      subtitle: 'مشکی مطلق #000000 با حداکثر کنتراست در شب',
      category: 'THEME',
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
      action: () => handleThemeSwitch('oled'),
    },
    {
      id: 'theme-system',
      title: 'تغییر پوسته به: هماهنگ با سیستم‌عامل (System)',
      subtitle: 'تشخیص خودکار حالت شب و روز ویندوز',
      category: 'THEME',
      icon: <Monitor className="w-4 h-4 text-text-muted" />,
      action: () => handleThemeSwitch('system'),
    },
  ];

  const filtered = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[selectedIndex]?.action();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-surface border border-border-subtle rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleListKeyDown}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle bg-elevated/40">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="جستجوی صفحه، فرمان یا تغییر سریع تم (مثلاً: آزمون، سپیا، OLED)..."
            className="w-full bg-transparent text-sm text-text-main placeholder:text-text-muted focus:outline-none"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono rounded bg-elevated text-text-muted border border-border-subtle">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-muted">
              فرمانی مطابق با «{query}» یافت نشد.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-start transition-colors ${
                    isSelected ? 'bg-accent/15 text-text-main' : 'hover:bg-elevated/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-elevated border border-border-subtle shrink-0">
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-text-main truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-text-muted truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <ArrowLeft
                    className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                      isSelected ? 'opacity-100 text-accent' : 'opacity-0'
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 bg-elevated/50 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-muted">
          <div className="flex items-center gap-2">
            <Keyboard className="w-3.5 h-3.5 text-accent" />
            <span>پالت فرمان سریع (Ctrl+K)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>جهت‌نما: ↑↓</span>
            <span>اجرا: Enter</span>
          </div>
        </div>
      </div>
    </div>
  );
}
