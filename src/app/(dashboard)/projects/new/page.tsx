import { db } from '@/db/client';
import { categories, projects, goals } from '@/db/schema';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function createProjectAction(formData: FormData) {
  'use server';

  const title = formData.get('title') as string;
  const categoryId = formData.get('categoryId') as string;
  const goalId = (formData.get('goalId') as string) || null;
  const description = (formData.get('description') as string) || null;
  const deadlineDate = (formData.get('deadlineDate') as string) || null;

  if (!title || !categoryId) {
    throw new Error('Title and category are required');
  }

  const now = new Date().toISOString();

  db.insert(projects).values({
    id: `proj_${Date.now()}`,
    categoryId,
    goalId,
    title,
    description,
    status: 'ACTIVE',
    deadlineDate,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  }).run();

  revalidatePath('/projects');
  revalidatePath('/goals');
  redirect('/projects');
}

export default async function NewProjectPage() {
  const allCategories = await db.select().from(categories).all();
  const allGoals = await db.select().from(goals).all();

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="p-1.5 rounded-lg hover:bg-elevated text-text-muted hover:text-text-main transition-colors"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">تعریف پروژه جدید (New Project)</h1>
          <p className="text-xs text-text-muted">ایجاد پروژه و اتصال اختیاری آن به اهداف</p>
        </div>
      </div>

      <form action={createProjectAction} className="bg-surface p-5 rounded-xl border border-border-subtle shadow-sm space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="block text-xs font-semibold text-text-main">
            عنوان پروژه
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="مثلاً: سیستم گفتار هوش مصنوعی یا توسعه ماژول دیتابیس"
            className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label htmlFor="categoryId" className="block text-xs font-semibold text-text-main">
            دسته‌بندی (حوزه زندگی)
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {allCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Goal Link */}
        {allGoals.length > 0 && (
          <div className="space-y-1.5">
            <label htmlFor="goalId" className="block text-xs font-semibold text-text-main">
              اتصال به هدف (اختیاری)
            </label>
            <select
              id="goalId"
              name="goalId"
              className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">بدون اتصال به هدف</option>
              {allGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-xs font-semibold text-text-main">
            توضیحات
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="اهداف و گستره فنی پروژه..."
            className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Deadline */}
        <div className="space-y-1.5">
          <label htmlFor="deadlineDate" className="block text-xs font-semibold text-text-main">
            مهلت زمانی (Deadline - اختیاری)
          </label>
          <input
            id="deadlineDate"
            name="deadlineDate"
            type="date"
            className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <Link
            href="/projects"
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-elevated transition-colors"
          >
            انصراف
          </Link>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:opacity-95 transition-opacity"
          >
            ذخیره پروژه
          </button>
        </div>
      </form>
    </div>
  );
}
