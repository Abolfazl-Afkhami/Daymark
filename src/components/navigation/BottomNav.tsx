// src/components/navigation/BottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, CheckCircle2, Clock, Target, BarChart3, BookOpen } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const mobileNavItems = [
    { href: '/today', label: t.nav.today, icon: Calendar },
    { href: '/focus', label: t.nav.focus, icon: Clock },
    { href: '/vault', label: t.nav.vault, icon: BookOpen },
    { href: '/habits', label: t.nav.habits, icon: CheckCircle2 },
    { href: '/goals', label: t.nav.goals, icon: Target },
    { href: '/analytics', label: t.nav.analytics, icon: BarChart3 },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-surface/95 backdrop-blur-md border-t border-border-subtle flex items-center justify-around px-1 z-40 pb-[env(safe-area-inset-bottom)] shadow-lg"
    >
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || (item.href !== '/today' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-1.5 py-1 rounded-xl text-[10px] font-medium transition-all ${
              isActive
                ? 'text-accent font-bold bg-accent/10 shadow-xs'
                : 'text-text-muted hover:text-text-main active:scale-95'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 shrink-0 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="truncate max-w-[56px] text-center">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
