// src/components/study/VaultClient.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  KnowledgeNoteRow,
  StudyReviewRow,
  PracticeLogRow,
} from '@/application/services/study-service';
import {
  addKnowledgeNoteAction,
  togglePinNoteAction,
  logPracticeTestAction,
} from '@/application/actions/study-actions';
import { deleteKnowledgeNoteAction } from '@/application/actions/delete-actions';
import { DeleteConfirmButton } from '@/components/ui/DeleteConfirmButton';
import { SpacedRepetitionDeck } from './SpacedRepetitionDeck';
import { calculateTestMetrics } from '@/domain/study/study-engine';
import { ExamAndPracticeManager, MockExamItem } from '@/components/vault/ExamAndPracticeManager';
import {
  BookOpen,
  Code2,
  BrainCircuit,
  BarChart2,
  Search,
  Plus,
  Pin,
  Trash2,
  Copy,
  Check,
  Tag,
  Clock,
  Sparkles,
  Calculator,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  colorHex?: string;
}

interface VaultClientProps {
  initialTab?: string;
  initialNotes: KnowledgeNoteRow[];
  dueReviews: StudyReviewRow[];
  allReviews: StudyReviewRow[];
  practiceLogs: any[];
  mockExams?: MockExamItem[];
  questionGoals?: Array<{ id: string; title: string }>;
  categories: CategoryItem[];
  todayCivilDate: string;
}

function resolveInitialTab(tab?: string): 'vault' | 'reviews' | 'practice' {
  if (tab === 'notes' || tab === 'vault') return 'vault';
  if (tab === 'reviews') return 'reviews';
  if (tab === 'practice' || tab === 'exams') return 'practice';
  return 'vault';
}

function resolveInitialEntryMode(tab?: string): 'PRACTICE' | 'MOCK_EXAM' {
  if (tab === 'practice') return 'PRACTICE';
  return 'MOCK_EXAM';
}

export function VaultClient({
  initialTab,
  initialNotes,
  dueReviews,
  allReviews,
  practiceLogs,
  mockExams = [],
  questionGoals = [],
  categories,
  todayCivilDate,
}: VaultClientProps) {
  const [activeTab, setActiveTab] = useState<'vault' | 'reviews' | 'practice'>(
    resolveInitialTab(initialTab)
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(resolveInitialTab(initialTab));
    }
  }, [initialTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Note Form State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteLanguage, setNoteLanguage] = useState('markdown');
  const [noteTags, setNoteTags] = useState('');
  const [noteAreaId, setNoteAreaId] = useState('');

  // Practice Test Form State
  const [practiceTopic, setPracticeTopic] = useState('');
  const [totalQuestions, setTotalQuestions] = useState<number | ''>('');
  const [correctCount, setCorrectCount] = useState<number | ''>('');
  const [wrongCount, setWrongCount] = useState<number | ''>('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
  const [practiceAreaId, setPracticeAreaId] = useState('');

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const fd = new FormData();
    fd.append('title', noteTitle);
    fd.append('content', noteContent);
    fd.append('language', noteLanguage);
    fd.append('tags', noteTags);
    if (noteAreaId) fd.append('areaId', noteAreaId);
    fd.append('civilDate', todayCivilDate);

    startTransition(async () => {
      await addKnowledgeNoteAction(fd);
      setNoteTitle('');
      setNoteContent('');
      setNoteTags('');
    });
  };

  const handleLogPractice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceTopic.trim() || !totalQuestions || Number(totalQuestions) <= 0) return;

    const fd = new FormData();
    fd.append('topic', practiceTopic);
    fd.append('totalQuestions', String(totalQuestions));
    fd.append('correctCount', String(correctCount || 0));
    fd.append('wrongCount', String(wrongCount || 0));
    fd.append('durationMinutes', String(durationMinutes || 0));
    fd.append('civilDate', todayCivilDate);
    if (practiceAreaId) fd.append('areaId', practiceAreaId);

    startTransition(async () => {
      await logPracticeTestAction(fd);
      setPracticeTopic('');
      setTotalQuestions('');
      setCorrectCount('');
      setWrongCount('');
      setDurationMinutes('');
    });
  };

  // Preview test metrics live
  const previewMetrics =
    totalQuestions && Number(totalQuestions) > 0
      ? calculateTestMetrics({
          totalQuestions: Number(totalQuestions),
          correctCount: Number(correctCount || 0),
          wrongCount: Number(wrongCount || 0),
          durationMinutes: Number(durationMinutes || 0),
        })
      : null;

  // Filter notes locally or by query
  const filteredNotes = initialNotes.filter((note) => {
    const matchesSearch =
      searchQuery === '' ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLang =
      selectedLanguage === 'all' || note.language?.toLowerCase() === selectedLanguage.toLowerCase();

    return matchesSearch && matchesLang;
  });

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex border-b border-border-subtle gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('vault')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'vault'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>خزانه دانش و یادگیری‌ها (TIL & Snippets)</span>
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs">
            {initialNotes.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'reviews'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>مرور فاصله‌دار (SuperMemo-2)</span>
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs">
            {dueReviews.length} امروز
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('practice')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'practice'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>تحلیل تست‌زنی و حل مسئله</span>
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs">
            {practiceLogs.length} لاگ
          </span>
        </button>
      </div>

      {/* TAB 1: KNOWLEDGE VAULT */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          {/* Quick Add Form */}
          <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-text-main flex items-center gap-2">
              <Plus className="w-4 h-4 text-accent" />
              <span>ثبت نکته فنی، فرمول یا یادگیری امروز (TIL)</span>
            </h3>

            <form onSubmit={handleAddNote} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="عنوان نکته یا اسنیپت (مثلاً: نحوه حل تعارض در Git یا فرمول پایستگی انرژی)..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="md:col-span-2 rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-sm text-text-main focus:border-accent focus:outline-none"
                  required
                />
                <select
                  value={noteLanguage}
                  onChange={(e) => setNoteLanguage(e.target.value)}
                  className="rounded-xl border border-border-subtle bg-canvas px-3 py-2 text-sm text-text-main focus:border-accent focus:outline-none"
                >
                  <option value="markdown">Markdown / متن</option>
                  <option value="ts">TypeScript / JS</option>
                  <option value="python">Python</option>
                  <option value="rust">Rust</option>
                  <option value="cpp">C++ / C</option>
                  <option value="sql">SQL / Database</option>
                  <option value="math">LaTeX / فرمول ریاضی</option>
                </select>
              </div>

              <textarea
                placeholder="محتوای نکته، تکه کد یا توضیح کوتاه..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2.5 text-sm text-text-main font-mono placeholder:font-sans focus:border-accent focus:outline-none"
                required
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="تگ‌ها با کاما (مثلاً: rust, async, algorithm)..."
                  value={noteTags}
                  onChange={(e) => setNoteTags(e.target.value)}
                  className="flex-1 rounded-xl border border-border-subtle bg-canvas px-3 py-1.5 text-xs text-text-main focus:border-accent focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={isPending || !noteTitle.trim() || !noteContent.trim()}
                  className="rounded-xl bg-accent px-5 py-2 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50 transition-all shadow-sm shrink-0"
                >
                  {isPending ? 'در حال ثبت...' : '+ ذخیره در خزانه'}
                </button>
              </div>
            </form>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-text-muted absolute right-3 top-3" />
              <input
                type="text"
                placeholder="جستجوی تمام‌متن FTS5 در خزانه دانش..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-surface pr-9 pl-3 py-2 text-sm text-text-main focus:border-accent focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['all', 'markdown', 'ts', 'python', 'rust', 'sql', 'math'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedLanguage === lang
                      ? 'bg-accent text-white'
                      : 'bg-surface border border-border-subtle text-text-muted hover:text-text-main'
                  }`}
                >
                  {lang === 'all' ? 'همه زبان‌ها' : lang}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="p-8 rounded-2xl bg-surface border border-dashed border-border-subtle text-center space-y-2">
              <BookOpen className="w-8 h-8 text-text-muted mx-auto" />
              <p className="text-sm font-semibold text-text-main">نکته‌ای یافت نشد</p>
              <p className="text-xs text-text-muted">
                اولین نکته آموزشی، تکه کد مهندسی یا فرمول درسی خود را در بالا ثبت کنید.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map((note) => {
                const parsedTags: string[] = (() => {
                  try {
                    return JSON.parse(note.tags);
                  } catch {
                    return [];
                  }
                })();

                return (
                  <div
                    key={note.id}
                    className={`rounded-2xl border bg-surface p-4 space-y-3 transition-all ${
                      note.is_pinned ? 'border-accent shadow-sm ring-1 ring-accent/30' : 'border-border-subtle'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {note.is_pinned === 1 && (
                            <Pin className="w-3.5 h-3.5 text-accent fill-accent shrink-0" />
                          )}
                          <h4 className="text-sm font-bold text-text-main">{note.title}</h4>
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-elevated text-text-muted uppercase">
                          {note.language}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(note.id, note.content)}
                          className="p-1 rounded text-text-muted hover:text-text-main hover:bg-elevated transition-colors"
                          title="کپی محتوا"
                        >
                          {copiedId === note.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            startTransition(async () => {
                              await togglePinNoteAction(note.id);
                            })
                          }
                          className="p-1 rounded text-text-muted hover:text-accent hover:bg-elevated transition-colors"
                          title={note.is_pinned ? 'آن‌پین کردن' : 'پین کردن'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${note.is_pinned ? 'fill-accent text-accent' : ''}`} />
                        </button>
                        <DeleteConfirmButton
                          onDelete={() => deleteKnowledgeNoteAction(note.id)}
                          itemLabel={note.title}
                          confirmText="حذف"
                          size="sm"
                        />
                      </div>
                    </div>

                    <pre className="p-3 rounded-xl bg-canvas border border-border-subtle text-xs font-mono text-text-main overflow-x-auto whitespace-pre-wrap max-h-48">
                      {note.content}
                    </pre>

                    {parsedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {parsedTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[11px] font-medium"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SPACED REPETITION (SM-2) */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <SpacedRepetitionDeck items={dueReviews} todayCivilDate={todayCivilDate} />

          {/* All Reviews Table */}
          <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-text-main flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-accent" />
              <span>تمام مباحث در چرخه حافظه بلندمدت ({allReviews.length} مبحث)</span>
            </h3>

            {allReviews.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-4">هنوز مبحثی ثبت نشده است.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-border-subtle text-text-muted">
                      <th className="py-2.5 px-3">عنوان مبحث</th>
                      <th className="py-2.5 px-3">دفعات مرور</th>
                      <th className="py-2.5 px-3">بازه (روز)</th>
                      <th className="py-2.5 px-3">ضریب سهولت (EF)</th>
                      <th className="py-2.5 px-3">تاریخ مرور بعدی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {allReviews.map((r) => (
                      <tr key={r.id} className="hover:bg-elevated/40">
                        <td className="py-2.5 px-3 font-semibold text-text-main">{r.title}</td>
                        <td className="py-2.5 px-3">{r.repetition_count} مرتبه</td>
                        <td className="py-2.5 px-3">{r.interval_days} روز</td>
                        <td className="py-2.5 px-3">{r.ease_factor}</td>
                        <td className="py-2.5 px-3 text-accent font-medium">{r.next_review_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PRACTICE & EXAM ANALYTICS */}
      {activeTab === 'practice' && (
        <ExamAndPracticeManager
          initialEntryMode={resolveInitialEntryMode(initialTab)}
          categories={categories}
          questionGoals={questionGoals}
          practiceLogs={practiceLogs}
          mockExams={mockExams}
          todayDate={todayCivilDate}
        />
      )}
    </div>
  );
}
