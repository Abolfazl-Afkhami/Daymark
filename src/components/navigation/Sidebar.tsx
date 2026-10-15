// src/components/navigation/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
  Settings,
  BookOpen,
  FolderKanban,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function Sidebar() {
  const pathname = usePathname();
  const { t, locale } = useI18n();

  const navItems = [
    { href: '/today', label: t.nav.today, icon: Calendar },
    { href: '/habits', label: t.nav.habits, icon: CheckCircle2 },
    { href: '/focus', label: t.nav.focus, icon: Clock },
    { href: '/vault', label: t.nav.vault, icon: BookOpen },
    { href: '/goals', label: t.nav.goals, icon: Target },
    { href: '/projects', label: t.nav.projects, icon: FolderKanban },
    { href: '/analytics', label: t.nav.analytics, icon: BarChart3 },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-e border-border-subtle bg-surface p-4 shrink-0 justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 border-b border-border-subtle mb-4">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white font-extrabold text-lg shadow-sm shrink-0">
            D
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight leading-tight text-text-main">
                Daymark
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-accent/15 text-accent font-bold">
                v1.1.2
              </span>
            </div>
            <p className="text-[11px] text-text-muted truncate">{t.nav.brandSubtitle}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== '/today' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-muted hover:bg-elevated hover:text-text-main'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Settings */}
      <div className="pt-3 border-t border-border-subtle">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            pathname === '/settings'
              ? 'bg-accent text-white shadow-sm'
              : 'text-text-muted hover:bg-elevated hover:text-text-main'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>{t.nav.settings}</span>
        </Link>
      </div>
    </aside>
  );
}
