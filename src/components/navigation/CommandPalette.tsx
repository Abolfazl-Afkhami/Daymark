'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, CheckCircle, Clock, Target, BarChart3, Settings, Plus, X } from 'lucide-react';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { id: 'today', title: 'داشبورد امروز (Today)', icon: Calendar, action: () => router.push('/today') },
    { id: 'new-habit', title: 'تعریف عادت جدید (New Habit)', icon: Plus, action: () => router.push('/habits/new') },
    { id: 'focus', title: 'جلسات تمرکز و تایمر (Focus Timer)', icon: Clock, action: () => router.push('/focus') },
    { id: 'goals', title: 'اهداف شخصی (Goals)', icon: Target, action: () => router.push('/goals') },
    { id: 'new-goal', title: 'تعریف هدف جدید (New Goal)', icon: Plus, action: () => router.push('/goals/new') },
    { id: 'projects', title: 'پروژه‌ها و تسک‌ها (Projects)', icon: CheckCircle, action: () => router.push('/projects') },
    { id: 'new-proj', title: 'تعریف پروژه جدید (New Project)', icon: Plus, action: () => router.push('/projects/new') },
    { id: 'analytics', title: 'آمار و تحلیل‌ها (Analytics)', icon: BarChart3, action: () => router.push('/analytics') },
    { id: 'settings', title: 'تنظیمات و پشتیبان‌گیری (Settings)', icon: Settings, action: () => router.push('/settings') },
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <div className="bg-surface border border-border-subtle rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden space-y-2">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
          <Search className="w-5 h-5 text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="دستور یا صفحه‌ای را جستجو کنید... (Ctrl+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-text-main focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-text-muted hover:text-text-main hover:bg-elevated"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 max-h-72 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-6">دستوری یافت نشد.</p>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/10 hover:text-accent text-sm text-text-main font-medium transition-colors text-start"
                >
                  <Icon className="w-4 h-4 text-text-muted group-hover:text-accent" />
                  <span>{item.title}</span>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 bg-elevated/50 border-t border-border-subtle flex justify-between text-[11px] text-text-muted">
          <span>برای انتخاب کلیک کنید</span>
          <span>کلید ESC برای بستن</span>
        </div>
      </div>
    </div>
  );
}
