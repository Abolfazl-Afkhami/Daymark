import { db } from '@/db/client';
import { projects, categories, tasks } from '@/db/schema';
import Link from 'next/link';
import { Plus, FolderGit2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const allProjects = await db.select().from(projects).all();
  const allCategories = await db.select().from(categories).all();

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">پروژه‌ها (Projects)</h1>
          <p className="text-sm text-text-muted mt-0.5">
            مدیریت پروژه‌های فنی، نرم‌افزاری و پژوهشی با سیستم وظایف دو سطحی
          </p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent text-white font-medium text-sm hover:opacity-95 transition-opacity shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>پروژه جدید</span>
        </Link>
      </div>

      {allProjects.length === 0 ? (
        <div className="p-8 rounded-xl bg-surface border border-dashed border-border-subtle text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-elevated mx-auto flex items-center justify-center text-text-muted">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-base text-text-main">پروژه‌ای تعریف نشده است</h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto">
            پروژه‌های نرم‌افزاری، یادگیری ماشین یا تحصیلی خود را تعریف و وظایف آن‌ها را سازماندهی کنید.
          </p>
          <div className="pt-2">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white font-medium text-sm hover:opacity-95 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span>تعریف اولین پروژه</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allProjects.map((proj) => {
            const cat = allCategories.find((c) => c.id === proj.categoryId);
            return (
              <Link
                key={proj.id}
                href={`/projects/${proj.id}`}
                className="p-4 rounded-xl bg-surface border border-border-subtle hover:border-accent/40 shadow-sm transition-all block space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-text-main">{proj.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-elevated text-text-muted">
                    {proj.status}
                  </span>
                </div>
                {proj.description && (
                  <p className="text-xs text-text-muted line-clamp-2">{proj.description}</p>
                )}
                <div className="flex items-center gap-2 pt-2 text-xs text-text-muted border-t border-border-subtle">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat?.colorHex || '#2563EB' }}
                  />
                  <span>{cat?.name || 'عمومی'}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
