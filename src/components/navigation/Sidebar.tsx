'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, CheckCircle2, Clock, Target, BarChart3, Settings, BookOpen } from 'lucide-react';

const navItems = [
  { href: '/today', label: 'امروز (Today)', icon: Calendar },
  { href: '/habits', label: 'عادت‌ها (Habits)', icon: CheckCircle2 },
  { href: '/focus', label: 'تمرکز (Focus)', icon: Clock },
  { href: '/vault', label: 'خزانه دانش (Vault)', icon: BookOpen },
  { href: '/goals', label: 'اهداف (Goals)', icon: Target },
  { href: '/analytics', label: 'تحلیل‌ها (Analytics)', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 border-e border-border-subtle bg-surface p-4 shrink-0">
      <div className="flex items-center gap-2 px-2 py-4 border-b border-border-subtle mb-4">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-lg">
          D
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight">Daymark</h1>
          <p className="text-xs text-text-muted">مدیریت عادات و بهره‌وری</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/today' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent font-semibold'
                  : 'text-text-muted hover:bg-elevated hover:text-text-main'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-border-subtle">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-text-muted hover:bg-elevated hover:text-text-main transition-colors ${
            pathname === '/settings' ? 'bg-accent/10 text-accent font-semibold' : ''
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>تنظیمات (Settings)</span>
        </Link>
      </div>
    </aside>
  );
}
