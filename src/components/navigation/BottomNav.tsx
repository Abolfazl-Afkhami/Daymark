'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, CheckCircle2, Clock, Target, BarChart3 } from 'lucide-react';

const mobileNavItems = [
  { href: '/today', label: 'امروز', icon: Calendar },
  { href: '/habits', label: 'عادت‌ها', icon: CheckCircle2 },
  { href: '/focus', label: 'تمرکز', icon: Clock },
  { href: '/goals', label: 'اهداف', icon: Target },
  { href: '/analytics', label: 'تحلیل', icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-surface border-t border-border-subtle flex items-center justify-around px-2 z-50 pb-[env(safe-area-inset-bottom)]">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/today' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg text-xs transition-colors ${
              isActive ? 'text-accent font-bold' : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
