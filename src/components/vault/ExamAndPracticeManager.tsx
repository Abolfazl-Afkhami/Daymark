// src/components/vault/ExamAndPracticeManager.tsx
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  createPracticeLogAction,
  createMockExamAction,
  deleteMockExamAction,
  deletePracticeLogAction,
} from '@/application/actions/vault-actions';
import { DatePickerDropdown } from '@/components/ui/DatePickerDropdown';
import { DeleteConfirmButton } from '@/components/ui/DeleteConfirmButton';
import {
  BookOpen,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Calculator,
  Layers,
} from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
  colorHex?: string;
}

interface GoalOption {
  id: string;
  title: string;
}

export interface PracticeLogItem {
  id: string;
  area_id: string | null;
  topic: string;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  blank_count: number;
  duration_minutes: number;
  civil_date: string;
}

export interface MockExamSubjectItem {
  id: string;
  exam_id: string;
  subject_name: string;
  coefficient: number;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  blank_count: number;
  raw_percentage: number;
  subject_taraz: number | null;
}

export interface MockExamItem {
  id: string;
  title: string;
  organization: string | null;
  exam_date: string;
  total_taraz: number | null;
  rank_city: number | null;
  rank_country: number | null;
  overall_percentage: number;
  duration_minutes: number;
  notes: string | null;
  subjects: MockExamSubjectItem[];
}

interface Props {
  initialEntryMode?: 'PRACTICE' | 'MOCK_EXAM';
  categories: CategoryOption[];
  questionGoals?: GoalOption[];
  practiceLogs: PracticeLogItem[];
  mockExams: MockExamItem[];
  todayDate: string;
}

function calcLivePercent(correct: number, wrong: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.round((((correct * 3 - wrong) / (total * 3)) * 100) * 10) / 10;
}

export function ExamAndPracticeManager({
  initialEntryMode = 'MOCK_EXAM',
  categories,
  questionGoals = [],
  practiceLogs,
  mockExams,
  todayDate,
}: Props) {
  const [entryMode, setEntryMode] = useState<'PRACTICE' | 'MOCK_EXAM'>(initialEntryMode);
  const [isPending, startTransition] = useTransition();
  const [expandedExamId, setExpandedExamId] = useState<string | null>(
    mockExams[0]?.id ?? null
  );

  useEffect(() => {
    if (initialEntryMode) {
      setEntryMode(initialEntryMode);
    }
  }, [initialEntryMode]);

  // --- Practice State ---
  const [pAreaId, setPAreaId] = useState<string>(categories[0]?.id ?? '');
  const [pGoalId, setPGoalId] = useState<string>('');
  const [pTopic, setPTopic] = useState('');
  const [pTotal, setPTotal] = useState<number>(40);
  const [pCorrect, setPCorrect] = useState<number>(30);
  const [pWrong, setPWrong] = useState<number>(5);
  const [pDuration, setPDuration] = useState<number>(45);
  const [pDate, setPDate] = useState<string>(todayDate);

  // --- Mock Exam State ---
  const [mTitle, setMTitle] = useState('');
  const [mOrg, setMOrg] = useState('قلمچی / سنجش / جامع');
  const [mDate, setMDate] = useState<string>(todayDate);
  const [mTotalTaraz, setMTotalTaraz] = useState<string>('');
  const [mRankCity, setMRankCity] = useState<string>('');
  const [mRankCountry, setMRankCountry] = useState<string>('');
  const [mDuration, setMDuration] = useState<number>(180);
  const [mNotes, setMNotes] = useState('');

  const [mSubjects, setMSubjects] = useState([
    {
      areaId: categories[0]?.id ?? '',
      subjectName: 'حسابان و ریاضیات',
      coefficient: 4,
      totalQuestions: 40,
      correctCount: 28,
      wrongCount: 4,
      subjectTaraz: '6850',
    },
    {
      areaId: categories[0]?.id ?? '',
      subjectName: 'فیزیک',
      coefficient: 3,
      totalQuestions: 35,
      correctCount: 25,
      wrongCount: 3,
      subjectTaraz: '6700',
    },
  ]);

  const handleAddSubjectRow = () => {
    setMSubjects((prev) => [
      ...prev,
      {
        areaId: categories[0]?.id ?? '',
        subjectName: '',
        coefficient: 2,
        totalQuestions: 30,
        correctCount: 0,
        wrongCount: 0,
        subjectTaraz: '',
      },
    ]);
  };

  const handleRemoveSubjectRow = (index: number) => {
    if (mSubjects.length <= 1) return;
    setMSubjects((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubjectChange = (index: number, field: string, value: string | number) => {
    setMSubjects((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handlePracticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTopic.trim()) return;
    const blank = Math.max(0, pTotal - (pCorrect + pWrong));

    startTransition(async () => {
      await createPracticeLogAction({
        areaId: pAreaId || null,
        goalId: pGoalId || null,
        topic: pTopic,
        totalQuestions: pTotal,
        correctCount: pCorrect,
        wrongCount: pWrong,
        blankCount: blank,
        durationMinutes: pDuration,
        civilDate: pDate,
      });
      setPTopic('');
    });
  };

  const handleMockExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle.trim()) return;

    startTransition(async () => {
      await createMockExamAction({
        title: mTitle,
        organization: mOrg,
        examDate: mDate,
        totalTaraz: mTotalTaraz ? Number(mTotalTaraz) : null,
        rankCity: mRankCity ? Number(mRankCity) : null,
        rankCountry: mRankCountry ? Number(mRankCountry) : null,
        durationMinutes: mDuration,
        notes: mNotes,
        subjects: mSubjects
          .filter((s) => s.subjectName.trim().length > 0)
          .map((s) => ({
            areaId: s.areaId || null,
            subjectName: s.subjectName,
            coefficient: Number(s.coefficient) || 1,
            totalQuestions: Number(s.totalQuestions) || 1,
            correctCount: Number(s.correctCount) || 0,
            wrongCount: Number(s.wrongCount) || 0,
            blankCount: Math.max(
              0,
              (Number(s.totalQuestions) || 1) -
                ((Number(s.correctCount) || 0) + (Number(s.wrongCount) || 0))
            ),
            subjectTaraz: s.subjectTaraz ? Number(s.subjectTaraz) : null,
          })),
      });
      setMTitle('');
      setMNotes('');
    });
  };

  const livePracticeBlank = Math.max(0, pTotal - (pCorrect + pWrong));
  const livePracticePct = calcLivePercent(pCorrect, pWrong, pTotal);

  return (
    <div className="space-y-6">
      {/* Mode Switcher Card */}
      <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
          <div>
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
              <Calculator className="w-5 h-5 text-accent" />
              <span>مرکز ثبت و تحلیل تست‌زنی و آزمون‌های آزمایشی</span>
            </h2>
            <p className="text-xs text-text-muted mt-1">
              نوع فعالیت خود را انتخاب کنید: ثبت سریع تست‌های مبحثی روزانه یا ثبت کارنامه کامل آزمون آزمایشی چنددرسی با تراز و ضرایب
            </p>
          </div>

          {/* Segmented Toggle */}
          <div className="inline-flex rounded-lg bg-elevated p-1 border border-border-subtle self-start">
            <button
              type="button"
              onClick={() => setEntryMode('MOCK_EXAM')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold transition-all ${
                entryMode === 'MOCK_EXAM'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>آزمون آزمایشی جامع</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('PRACTICE')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold transition-all ${
                entryMode === 'PRACTICE'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>تست‌زنی روزانه مبحثی</span>
            </button>
          </div>
        </div>

        {/* FORM 1: MOCK EXAM (Master-Detail) */}
        {entryMode === 'MOCK_EXAM' ? (
          <form onSubmit={handleMockExamSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-text-main">
                  عنوان آزمون آزمایشی *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: آزمون جامع مرحله ۴ قلمچی / کنکور آزمایشی دی"
                  value={mTitle}
                  onChange={(e) => setMTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-main">موسسه / منبع</label>
                <input
                  type="text"
                  placeholder="قلمچی، سنجش، ماز..."
                  value={mOrg}
                  onChange={(e) => setMOrg(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-main">تاریخ آزمون</label>
                <DatePickerDropdown
                  value={mDate}
                  onChange={setMDate}
                  placeholder="انتخاب تاریخ آزمون..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-elevated/60 p-3.5 rounded-lg border border-border-subtle">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-main">تراز کل آزمون</label>
                <input
                  type="number"
                  placeholder="مثلاً 6920"
                  value={mTotalTaraz}
                  onChange={(e) => setMTotalTaraz(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-border-subtle bg-surface text-sm tabular-nums font-bold text-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-main">رتبه کشوری</label>
                <input
                  type="number"
                  placeholder="مثلاً 145"
                  value={mRankCountry}
                  onChange={(e) => setMRankCountry(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-border-subtle bg-surface text-sm tabular-nums"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-main">رتبه شهر / منطقه</label>
                <input
                  type="number"
                  placeholder="مثلاً 18"
                  value={mRankCity}
                  onChange={(e) => setMRankCity(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-border-subtle bg-surface text-sm tabular-nums"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-main">زمان کل (دقیقه)</label>
                <input
                  type="number"
                  min={1}
                  value={mDuration}
                  onChange={(e) => setMDuration(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-md border border-border-subtle bg-surface text-sm tabular-nums"
                />
              </div>
            </div>

            {/* Dynamic Subjects Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-text-main flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-accent" />
                  <span>ریزِ دروس، درصدها و تراز هر درس</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddSubjectRow}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-elevated hover:bg-accent hover:text-white text-text-main text-xs font-semibold transition-colors border border-border-subtle"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>افزودن درس جدید</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-border-subtle rounded-lg">
                <table className="w-full text-xs text-start">
                  <thead className="bg-elevated text-text-muted border-b border-border-subtle">
                    <tr>
                      <th className="py-2.5 px-3 text-start">نام درس</th>
                      <th className="py-2.5 px-2 text-center w-16">ضریب</th>
                      <th className="py-2.5 px-2 text-center w-20">کل سوالات</th>
                      <th className="py-2.5 px-2 text-center w-20 text-status-complete">درست</th>
                      <th className="py-2.5 px-2 text-center w-20 text-status-missed">غلط</th>
                      <th className="py-2.5 px-2 text-center w-16">نزده</th>
                      <th className="py-2.5 px-2 text-center w-24">درصد (با نمره منفی)</th>
                      <th className="py-2.5 px-2 text-center w-24">تراز درس</th>
                      <th className="py-2.5 px-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle bg-surface">
                    {mSubjects.map((sub, idx) => {
                      const blank = Math.max(
                        0,
                        Number(sub.totalQuestions) -
                          (Number(sub.correctCount) + Number(sub.wrongCount))
                      );
                      const livePct = calcLivePercent(
                        Number(sub.correctCount),
                        Number(sub.wrongCount),
                        Number(sub.totalQuestions)
                      );
                      return (
                        <tr key={idx} className="hover:bg-elevated/40">
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              placeholder="نام درس (مثلاً فیزیک)"
                              value={sub.subjectName}
                              onChange={(e) =>
                                handleSubjectChange(idx, 'subjectName', e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 rounded border border-border-subtle bg-canvas text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min={1}
                              max={12}
                              value={sub.coefficient}
                              onChange={(e) =>
                                handleSubjectChange(idx, 'coefficient', Number(e.target.value))
                              }
                              className="w-full px-2 py-1.5 rounded border border-border-subtle bg-canvas text-center tabular-nums"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min={1}
                              value={sub.totalQuestions}
                              onChange={(e) =>
                                handleSubjectChange(idx, 'totalQuestions', Number(e.target.value))
                              }
                              className="w-full px-2 py-1.5 rounded border border-border-subtle bg-canvas text-center tabular-nums"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min={0}
                              value={sub.correctCount}
                              onChange={(e) =>
                                handleSubjectChange(idx, 'correctCount', Number(e.target.value))
                              }
                              className="w-full px-2 py-1.5 rounded border border-status-complete/40 bg-canvas text-center tabular-nums font-semibold text-status-complete"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min={0}
                              value={sub.wrongCount}
                              onChange={(e) =>
                                handleSubjectChange(idx, 'wrongCount', Number(e.target.value))
                              }
                              className="w-full px-2 py-1.5 rounded border border-status-missed/40 bg-canvas text-center tabular-nums font-semibold text-status-missed"
                            />
                          </td>
                          <td className="p-2 text-center tabular-nums text-text-muted font-medium">
                            {blank}
                          </td>
                          <td className="p-2 text-center tabular-nums font-bold">
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                livePct >= 60
                                  ? 'bg-status-complete/15 text-status-complete'
                                  : livePct >= 30
                                  ? 'bg-status-partial/15 text-status-partial'
                                  : 'bg-status-missed/15 text-status-missed'
                              }`}
                            >
                              {livePct}%
                            </span>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              placeholder="تراز"
                              value={sub.subjectTaraz}
                              onChange={(e) =>
                                handleSubjectChange(idx, 'subjectTaraz', e.target.value)
                              }
                              className="w-full px-2 py-1.5 rounded border border-border-subtle bg-canvas text-center tabular-nums"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveSubjectRow(idx)}
                              disabled={mSubjects.length <= 1}
                              className="text-text-muted hover:text-status-missed disabled:opacity-30 p-1"
                              title="حذف درس"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <input
                type="text"
                placeholder="یادداشت تحلیلی آزمون (علت بی‌دقتی‌ها، مدیریت زمان و ...)"
                value={mNotes}
                onChange={(e) => setMNotes(e.target.value)}
                className="w-full sm:flex-1 px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-xs"
              />
              <button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-accent text-white font-bold text-xs hover:opacity-95 transition-opacity disabled:opacity-50"
              >
                {isPending ? 'در حال ثبت کارنامه...' : 'ثبت کارنامه آزمون آزمایشی'}
              </button>
            </div>
          </form>
        ) : (
          /* FORM 2: DAILY PRACTICE LOG */
          <form onSubmit={handlePracticeSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-main">حوزه / دسته‌بندی</label>
                <select
                  value={pAreaId}
                  onChange={(e) => setPAreaId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-text-main">
                  نام درس و مبحث تست‌زنی *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: مشتق و کاربرد مشتق - موج الکتریکی"
                  value={pTopic}
                  onChange={(e) => setPTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-main">تاریخ تست‌زنی</label>
                <DatePickerDropdown
                  value={pDate}
                  onChange={setPDate}
                  placeholder="انتخاب تاریخ تست‌زنی..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-main">اتصال به هدف (اختیاری)</label>
                <select
                  value={pGoalId}
                  onChange={(e) => setPGoalId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-xs"
                >
                  <option value="">-- بدون اتصال مستقیم --</option>
                  {questionGoals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-elevated/50 p-3.5 rounded-lg border border-border-subtle">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-main">کل تست‌ها</label>
                <input
                  type="number"
                  min={1}
                  value={pTotal}
                  onChange={(e) => setPTotal(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded border border-border-subtle bg-surface text-sm tabular-nums font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-status-complete">تعداد درست</label>
                <input
                  type="number"
                  min={0}
                  value={pCorrect}
                  onChange={(e) => setPCorrect(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded border border-status-complete/40 bg-surface text-sm tabular-nums font-bold text-status-complete"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-status-missed">تعداد غلط</label>
                <input
                  type="number"
                  min={0}
                  value={pWrong}
                  onChange={(e) => setPWrong(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded border border-status-missed/40 bg-surface text-sm tabular-nums font-bold text-status-missed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-main">مدت زمان (دقیقه)</label>
                <input
                  type="number"
                  min={1}
                  value={pDuration}
                  onChange={(e) => setPDuration(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded border border-border-subtle bg-surface text-sm tabular-nums"
                />
              </div>

              <div className="flex flex-col justify-center items-center bg-surface rounded border border-border-subtle p-2">
                <span className="text-[11px] text-text-muted">درصد خالص ({livePracticeBlank} نزده)</span>
                <span className="text-base font-extrabold tabular-nums text-accent">
                  {livePracticePct}%
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-lg bg-accent text-white font-bold text-xs hover:opacity-95 transition-opacity disabled:opacity-50"
              >
                {isPending ? 'در حال ثبت...' : 'ثبت نوبت تست‌زنی (و آپدیت خودکار هدف)'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ARCHIVE SECTION: Mock Exams & Practice History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mock Exams List */}
        <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" />
              <span>کارنامه‌های آزمون آزمایشی ({mockExams.length})</span>
            </h3>
          </div>

          {mockExams.length === 0 ? (
            <p className="text-xs text-text-muted py-6 text-center">
              هنوز کارنامه آزمون آزمایشی ثبت نشده است.
            </p>
          ) : (
            <div className="space-y-3">
              {mockExams.map((exam) => {
                const isExpanded = expandedExamId === exam.id;
                return (
                  <div
                    key={exam.id}
                    className="border border-border-subtle rounded-lg overflow-hidden bg-canvas/50"
                  >
                    <div
                      onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                      className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-elevated/60 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-text-main">{exam.title}</span>
                          {exam.organization && (
                            <span className="px-2 py-0.5 rounded bg-elevated text-[11px] text-text-muted">
                              {exam.organization}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted tabular-nums">
                          <span>تاریخ: {exam.exam_date}</span>
                          <span className="font-bold text-accent">
                            میانگین وزنی: {exam.overall_percentage}%
                          </span>
                          {exam.total_taraz && (
                            <span className="font-bold text-status-complete">
                              تراز کل: {exam.total_taraz}
                            </span>
                          )}
                          {exam.rank_country && <span>رتبه کشوری: {exam.rank_country}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <DeleteConfirmButton
                          onDelete={() => deleteMockExamAction(exam.id)}
                          itemLabel={exam.title}
                          confirmText="حذف آزمون"
                          size="sm"
                        />
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-text-muted" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-text-muted" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-border-subtle p-3 bg-surface space-y-2">
                        <table className="w-full text-xs">
                          <thead className="text-text-muted border-b border-border-subtle">
                            <tr>
                              <th className="py-1.5 text-start">درس</th>
                              <th className="py-1.5 text-center">ضریب</th>
                              <th className="py-1.5 text-center text-status-complete">درست</th>
                              <th className="py-1.5 text-center text-status-missed">غلط</th>
                              <th className="py-1.5 text-center">نزده</th>
                              <th className="py-1.5 text-center">درصد</th>
                              <th className="py-1.5 text-center">تراز</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-subtle/60 tabular-nums">
                            {exam.subjects.map((sub) => (
                              <tr key={sub.id}>
                                <td className="py-1.5 font-semibold text-text-main">
                                  {sub.subject_name}
                                </td>
                                <td className="py-1.5 text-center">{sub.coefficient}</td>
                                <td className="py-1.5 text-center text-status-complete font-medium">
                                  {sub.correct_count}
                                </td>
                                <td className="py-1.5 text-center text-status-missed font-medium">
                                  {sub.wrong_count}
                                </td>
                                <td className="py-1.5 text-center text-text-muted">
                                  {sub.blank_count}
                                </td>
                                <td className="py-1.5 text-center font-bold text-accent">
                                  {sub.raw_percentage}%
                                </td>
                                <td className="py-1.5 text-center font-semibold">
                                  {sub.subject_taraz ?? '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {exam.notes && (
                          <p className="text-[11px] text-text-muted bg-elevated/50 p-2 rounded">
                            یادداشت: {exam.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Daily Practice Logs List */}
        <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            <span>تاریخچه تست‌زنی‌های مبحثی اخیر ({practiceLogs.length})</span>
          </h3>

          {practiceLogs.length === 0 ? (
            <p className="text-xs text-text-muted py-6 text-center">
              هنوز نوبت تست‌زنی روزانه ثبت نشده است.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pe-1">
              {practiceLogs.map((log) => {
                const pct = calcLivePercent(
                  log.correct_count,
                  log.wrong_count,
                  log.total_questions
                );
                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border border-border-subtle bg-canvas/40 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-text-main">{log.topic}</div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted tabular-nums">
                        <span>{log.civil_date}</span>
                        <span>کل: {log.total_questions} تست</span>
                        <span className="text-status-complete font-semibold">
                          ✓ {log.correct_count}
                        </span>
                        <span className="text-status-missed font-semibold">
                          ✗ {log.wrong_count}
                        </span>
                        <span>○ {log.blank_count}</span>
                        <span>⏱ {log.duration_minutes} دقیقه</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-extrabold tabular-nums ${
                          pct >= 65
                            ? 'bg-status-complete/15 text-status-complete'
                            : pct >= 35
                            ? 'bg-status-partial/15 text-status-partial'
                            : 'bg-status-missed/15 text-status-missed'
                        }`}
                      >
                        {pct}%
                      </span>
                      <DeleteConfirmButton
                        onDelete={() => deletePracticeLogAction(log.id)}
                        itemLabel={log.topic}
                        confirmText="حذف"
                        size="sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
