'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { logStudySessionAction } from '@/application/actions/session-actions';

interface CategoryItem {
  id: string;
  name: string;
  colorHex: string;
}

interface ProjectItem {
  id: string;
  title: string;
}

interface GoalItem {
  id: string;
  title: string;
}

interface FocusTimerProps {
  categories: CategoryItem[];
  projects: ProjectItem[];
  goals: GoalItem[];
}

export function FocusTimer({ categories, projects, goals }: FocusTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [accumulatedMs, setAccumulatedMs] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [projectId, setProjectId] = useState('');
  const [goalId, setGoalId] = useState('');
  const [sessionType, setSessionType] = useState('STUDY');
  const [questionsCompleted, setQuestionsCompleted] = useState<number | ''>('');
  const [subjectTag, setSubjectTag] = useState('');
  const [notes, setNotes] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && startedAt) {
      timerRef.current = setInterval(() => {
        // Precise drift-free calculation based on system clock
        const currentMs = Date.now() - startedAt + accumulatedMs;
        setElapsedSeconds(Math.floor(currentMs / 1000));
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, startedAt, accumulatedMs]);

  const handleStart = () => {
    setStartedAt(Date.now());
    setIsRunning(true);
  };

  const handlePause = () => {
    if (startedAt) {
      setAccumulatedMs((prev) => prev + (Date.now() - startedAt));
      setStartedAt(null);
      setIsRunning(false);
    }
  };

  const handleStopAndSave = async () => {
    const totalMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    const formData = new FormData();
    formData.append('categoryId', categoryId);
    if (projectId) formData.append('projectId', projectId);
    if (goalId) formData.append('goalId', goalId);
    formData.append('sessionType', sessionType);
    formData.append('durationMinutes', String(totalMinutes));
    if (questionsCompleted) formData.append('questionsCompleted', String(questionsCompleted));
    if (subjectTag) formData.append('subjectTag', subjectTag);
    if (notes) formData.append('notes', notes);

    await logStudySessionAction(formData);

    // Reset timer
    setIsRunning(false);
    setStartedAt(null);
    setAccumulatedMs(0);
    setElapsedSeconds(0);
    setQuestionsCompleted('');
    setSubjectTag('');
    setNotes('');
  };

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm space-y-6">
      {/* Timer Display */}
      <div className="flex flex-col items-center justify-center py-6 border-b border-border-subtle">
        <div className="flex items-center gap-2 text-text-muted text-xs font-medium mb-3">
          <Clock className="w-4 h-4 text-accent" />
          <span>تایمر زنده جلسات تمرکز و مطالعه (بدون تاخیر زمانی)</span>
        </div>
        <div className="text-5xl md:text-6xl font-black tracking-tight text-text-main font-mono tabular-nums">
          {formattedTime}
        </div>

        {/* Play/Pause/Stop Controls */}
        <div className="flex items-center gap-3 mt-6">
          {!isRunning ? (
            <button
              type="button"
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:opacity-95 transition-all shadow-md active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{elapsedSeconds > 0 ? 'ادامه تمرکز' : 'شروع تمرکز'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:opacity-95 transition-all shadow-md active:scale-95"
            >
              <Pause className="w-4 h-4 fill-white" />
              <span>مکث (Pause)</span>
            </button>
          )}

          {elapsedSeconds > 0 && (
            <button
              type="button"
              onClick={handleStopAndSave}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-status-complete text-white font-semibold text-sm hover:opacity-95 transition-all shadow-md active:scale-95"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>پایان و ذخیره جلسه</span>
            </button>
          )}
        </div>
      </div>

      {/* Session Metadata Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-main">دسته‌بندی (حوزه فعالیت)</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isRunning}
            className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Session Type */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-main">نوع جلسه</label>
          <select
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            disabled={isRunning}
            className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="STUDY">مطالعه درسی (Study)</option>
            <option value="PRACTICE_QUESTIONS">حل تست و تمرین (Practice Questions)</option>
            <option value="ERROR_REVIEW">تحلیل آزمون و مرور خطاها (Error Review)</option>
            <option value="CODING">کدنویسی و توسعه (Coding)</option>
            <option value="RESEARCH">پژوهش و تحقیق هوش مصنوعی (Research)</option>
            <option value="MOCK_EXAM">آزمون آزمایشی شبیه‌سازی (Mock Exam)</option>
          </select>
        </div>

        {/* Link to Project */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-main">اتصال به پروژه (اختیاری)</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={isRunning}
            className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">بدون پروژه</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Link to Goal */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-main">اتصال به هدف (جهت افزایش پیشرفت)</label>
          <select
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            disabled={isRunning}
            className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">بدون هدف</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>

        {/* Completed Practice Questions */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-main">تعداد تست‌های حل‌شده (در صورت وجود)</label>
          <input
            type="number"
            min="0"
            placeholder="مثلاً: 35"
            value={questionsCompleted}
            onChange={(e) => setQuestionsCompleted(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Subject Tag */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-main">موضوع / تگ مبحث</label>
          <input
            type="text"
            placeholder="مثلاً: فیزیک حرکت‌شناسی، Speech AI"
            value={subjectTag}
            onChange={(e) => setSubjectTag(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>
    </div>
  );
}
