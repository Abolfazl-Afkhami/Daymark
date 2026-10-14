// src/components/navigation/CommandPalette.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Calendar,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Settings,
  Plus,
  X,
  Sparkles,
  BookOpen,
  Terminal,
  Zap,
} from 'lucide-react';
import { parseCLICommand, ParsedCLICommand } from '@/domain/cli/command-parser';
import {
  createReviewAction,
  addKnowledgeNoteAction,
  logPracticeTestAction,
} from '@/application/actions/study-actions';
import { getLogicalToday } from '@/domain/calendar/civil-date';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setFeedback(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { id: 'today', title: 'داشبورد امروز (Today)', icon: Calendar, action: () => router.push('/today') },
    { id: 'vault', title: 'خزانه دانش و یادگیری‌ها (Knowledge Vault & TIL)', icon: BookOpen, action: () => router.push('/vault') },
    { id: 'focus', title: 'جلسات تمرکز و تایمر (Focus Timer)', icon: Clock, action: () => router.push('/focus') },
    { id: 'goals', title: 'اهداف شخصی (Goals)', icon: Target, action: () => router.push('/goals') },
    { id: 'projects', title: 'پروژه‌ها و تسک‌ها (Projects)', icon: CheckCircle, action: () => router.push('/projects') },
    { id: 'analytics', title: 'آمار و تحلیل‌ها (Analytics)', icon: BarChart3, action: () => router.push('/analytics') },
    { id: 'new-habit', title: 'تعریف عادت جدید (New Habit)', icon: Plus, action: () => router.push('/habits/new') },
    { id: 'new-goal', title: 'تعریف هدف جدید (New Goal)', icon: Plus, action: () => router.push('/goals/new') },
    { id: 'new-proj', title: 'تعریف پروژه جدید (New Project)', icon: Plus, action: () => router.push('/projects/new') },
    { id: 'settings', title: 'تنظیمات و پشتیبان‌گیری (Settings)', icon: Settings, action: () => router.push('/settings') },
  ];

  const parsedCommand: ParsedCLICommand = parseCLICommand(query);

  const executeCLICommand = () => {
    const today = getLogicalToday(new Date(), 'Asia/Tehran', 4);

    if (parsedCommand.type === 'FOCUS') {
      setIsOpen(false);
      setQuery('');
      router.push('/focus');
      return;
    }

    if (parsedCommand.type === 'REVIEW_ADD') {
      startTransition(async () => {
        await createReviewAction(parsedCommand.title, today);
        setFeedback(`مبحث «${parsedCommand.title}» به چرخه مرور SM-2 افزوده شد.`);
        setTimeout(() => {
          setIsOpen(false);
          setQuery('');
          setFeedback(null);
          router.refresh();
        }, 900);
      });
      return;
    }

    if (parsedCommand.type === 'TIL_ADD') {
      startTransition(async () => {
        const fd = new FormData();
        fd.append('title', parsedCommand.title);
        fd.append('content', parsedCommand.title);
        if (parsedCommand.tag) fd.append('tags', parsedCommand.tag);
        fd.append('civilDate', today);
        await addKnowledgeNoteAction(fd);
        setFeedback(`نکته «${parsedCommand.title}» در خزانه دانش ثبت شد.`);
        setTimeout(() => {
          setIsOpen(false);
          setQuery('');
          setFeedback(null);
          router.refresh();
        }, 900);
      });
      return;
    }

    if (parsedCommand.type === 'TEST_LOG') {
      startTransition(async () => {
        const fd = new FormData();
        fd.append('topic', parsedCommand.topic);
        fd.append('totalQuestions', String(parsedCommand.total));
        fd.append('correctCount', String(parsedCommand.correct));
        fd.append('wrongCount', String(parsedCommand.wrong));
        fd.append('civilDate', today);
        await logPracticeTestAction(fd);
        setFeedback(`لاگ آزمون «${parsedCommand.topic}» ثبت گردید.`);
        setTimeout(() => {
          setIsOpen(false);
          setQuery('');
          setFeedback(null);
          router.refresh();
        }, 900);
      });
      return;
    }
  };

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <div className="bg-surface border border-border-subtle rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden space-y-2">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
          <Terminal className="w-5 h-5 text-accent shrink-0" />
          <input
            type="text"
            placeholder="جستجو یا دستور سریع (مثلاً f 45m #AI یا r دینامیک یا til نکته)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setFeedback(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (parsedCommand.type !== 'SEARCH') {
                  e.preventDefault();
                  executeCLICommand();
                } else if (filtered.length > 0) {
                  e.preventDefault();
                  filtered[0]?.action();
                  setIsOpen(false);
                }
              }
            }}
            autoFocus
            className="w-full bg-transparent text-sm text-text-main focus:outline-none placeholder:text-text-muted"
          />
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setFeedback(null);
            }}
            className="p-1 rounded-md text-text-muted hover:text-text-main hover:bg-elevated"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className="px-4 py-2 mx-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium animate-in fade-in">
            {feedback}
          </div>
        )}

        {/* CLI Quick Action Card if parsed */}
        {parsedCommand.type !== 'SEARCH' && (
          <div className="p-2 border-b border-border-subtle bg-accent/5">
            <button
              type="button"
              onClick={executeCLICommand}
              disabled={isPending}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-accent text-white text-sm font-semibold hover:opacity-95 transition-all shadow-sm text-start"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 fill-white shrink-0 animate-bounce" />
                <div>
                  {parsedCommand.type === 'FOCUS' && (
                    <span>شروع تمرکز {parsedCommand.durationMinutes} دقیقه‌ای {parsedCommand.tag ? `#${parsedCommand.tag}` : ''}</span>
                  )}
                  {parsedCommand.type === 'REVIEW_ADD' && (
                    <span>افزودن به چرخه مرور SM-2: «{parsedCommand.title}»</span>
                  )}
                  {parsedCommand.type === 'TIL_ADD' && (
                    <span>ثبت در خزانه دانش: «{parsedCommand.title}» {parsedCommand.tag ? `#${parsedCommand.tag}` : ''}</span>
                  )}
                  {parsedCommand.type === 'TEST_LOG' && (
                    <span>ثبت آزمون: {parsedCommand.total} سوال ({parsedCommand.correct} درست، {parsedCommand.wrong} غلط) - {parsedCommand.topic}</span>
                  )}
                  <p className="text-[11px] text-white/80 font-normal">کلید Enter را برای اجرای فوری بزنید</p>
                </div>
              </div>
              <span className="text-xs bg-white/20 px-2.5 py-1 rounded-md shrink-0">Enter ↵</span>
            </button>
          </div>
        )}

        {/* Commands List */}
        <div className="p-2 max-h-72 overflow-y-auto space-y-1">
          {filtered.length === 0 && parsedCommand.type === 'SEARCH' ? (
            <div className="text-center py-6 space-y-2">
              <p className="text-xs text-text-muted">دستوری مطابق با جستجوی شما یافت نشد.</p>
              <div className="text-[11px] text-text-muted/70 space-y-1">
                <p>فرمت‌های خط فرمان سریع مهندسی:</p>
                <p><code className="text-accent">f 45 #physics</code> (شروع تمرکز)</p>
                <p><code className="text-accent">r مبحث جدید</code> (مرور هوشمند)</p>
                <p><code className="text-accent">til نکته جدید #tag</code> (خزانه دانش)</p>
                <p><code className="text-accent">test 25 20 3 هندسه</code> (ثبت تست)</p>
              </div>
            </div>
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
                  <Icon className="w-4 h-4 text-text-muted group-hover:text-accent shrink-0" />
                  <span>{item.title}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-elevated/50 border-t border-border-subtle flex justify-between text-[11px] text-text-muted">
          <span>دستور سریع: <code className="text-accent">f &lt;min&gt;</code> • <code className="text-accent">r &lt;topic&gt;</code> • <code className="text-accent">til &lt;note&gt;</code></span>
          <span>ESC برای بستن</span>
        </div>
      </div>
    </div>
  );
}
