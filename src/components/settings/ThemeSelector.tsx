'use client';

import { useState, useTransition } from 'react';
import { applyThemeImmediately, ThemeMode } from '@/lib/theme';
import { updateThemeAction } from '@/application/actions/settings-actions';
import { Monitor, Sun, Moon, BookOpen, Smartphone, Check } from 'lucide-react';

interface ThemeOption {
  id: ThemeMode;
  label: string;
  sublabel: string;
  badge: string;
  icon: typeof Sun;
  previewBg: string;
  previewCardBg: string;
  previewBorder: string;
  previewTextColor: string;
  previewAccent: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'system',
    label: 'سیستم‌عامل (System)',
    sublabel: 'هماهنگ با تم ویندوز / دستگاه',
    badge: 'خودکار',
    icon: Monitor,
    previewBg: 'bg-gradient-to-r from-slate-100 to-slate-900',
    previewCardBg: 'bg-slate-200 dark:bg-slate-800',
    previewBorder: 'border-slate-300 dark:border-slate-700',
    previewTextColor: 'text-slate-800 dark:text-slate-100',
    previewAccent: '#3B82F6',
  },
  {
    id: 'light',
    label: 'روشن (Light)',
    sublabel: 'سفید مینیمال با کنتراست روز',
    badge: 'استاندارد',
    icon: Sun,
    previewBg: 'bg-[#F8FAFC]',
    previewCardBg: 'bg-white',
    previewBorder: 'border-[#E2E8F0]',
    previewTextColor: 'text-[#0F172A]',
    previewAccent: '#2563EB',
  },
  {
    id: 'dark',
    label: 'تاریک (Dark)',
    sublabel: 'خاکستری ارگونومیک، کاهش خستگی چشم',
    badge: 'محبوب',
    icon: Moon,
    previewBg: 'bg-[#0F172A]',
    previewCardBg: 'bg-[#1E293B]',
    previewBorder: 'border-[#334155]',
    previewTextColor: 'text-[#F1F5F9]',
    previewAccent: '#60A5FA',
  },
  {
    id: 'sepia',
    label: 'سپیا / کتاب‌خوان (Sepia)',
    sublabel: 'کاغذ کاهی گرم، ایده‌آل برای مطالعه شبانه',
    badge: 'ویژه مطالعه',
    icon: BookOpen,
    previewBg: 'bg-[#FBF0D9]',
    previewCardBg: 'bg-[#F4E3C1]',
    previewBorder: 'border-[#E0D0B4]',
    previewTextColor: 'text-[#433422]',
    previewAccent: '#C05621',
  },
  {
    id: 'oled',
    label: 'سیاه خالص (OLED Black)',
    sublabel: 'مشکی مطلق (#000000) و حداکثر کنتراست',
    badge: 'صرفه‌جویی باتری',
    icon: Smartphone,
    previewBg: 'bg-[#000000]',
    previewCardBg: 'bg-[#111111]',
    previewBorder: 'border-[#222222]',
    previewTextColor: 'text-[#EDEDED]',
    previewAccent: '#38BDF8',
  },
];

interface ThemeSelectorProps {
  currentTheme: ThemeMode;
}

export function ThemeSelector({ currentTheme }: ThemeSelectorProps) {
  const [selected, setSelected] = useState<ThemeMode>(currentTheme);
  const [isPending, startTransition] = useTransition();

  const handleSelect = (mode: ThemeMode) => {
    setSelected(mode);
    applyThemeImmediately(mode);

    startTransition(async () => {
      try {
        await updateThemeAction(mode);
      } catch (err) {
        console.error('Failed to persist theme:', err);
      }
    });
  };

  return (
    <div className="space-y-3">
      {/* Hidden input for parent form integration */}
      <input type="hidden" name="theme" value={selected} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selected === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className={`group relative text-right p-4 rounded-xl border-2 transition-all flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'border-accent bg-accent/5 ring-2 ring-accent/20 shadow-md'
                  : 'border-border-subtle bg-surface hover:border-text-muted/30 hover:shadow-sm'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-accent text-white' : 'bg-elevated text-text-muted group-hover:text-text-main'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-text-main block">{opt.label}</span>
                      <span className="text-[10px] text-text-muted">{opt.badge}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-text-muted leading-relaxed">{opt.sublabel}</p>
              </div>

              {/* Theme Mini Preview Palette */}
              <div className="mt-3 pt-3 border-t border-border-subtle/50 flex items-center gap-1.5">
                <div className={`w-full h-7 rounded-lg border flex items-center px-2 gap-1.5 overflow-hidden ${opt.previewBg} ${opt.previewBorder}`}>
                  <div className={`w-3.5 h-3.5 rounded shrink-0 shadow-xs ${opt.previewCardBg}`} />
                  <div className="w-full h-1.5 rounded-full bg-current opacity-20" />
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: opt.previewAccent }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {isPending && (
        <p className="text-[11px] text-accent font-medium animate-pulse">
          در حال ثبت تغییرات پوسته در دیتابیس...
        </p>
      )}
    </div>
  );
}
