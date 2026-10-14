import { db } from '@/db/client';
import { projects, categories, tasks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, FolderGit2 } from 'lucide-react';
import { TaskChecklist } from '@/components/projects/TaskChecklist';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  if (!project) {
    notFound();
  }

  const projectCategory = await db.query.categories.findFirst({
    where: eq(categories.id, project.categoryId),
  });

  const projectTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, id))
    .all();

  const doneCount = projectTasks.filter((t) => t.status === 'DONE').length;
  const progressPercent = projectTasks.length > 0 ? Math.round((doneCount / projectTasks.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="p-1.5 rounded-lg hover:bg-elevated text-text-muted hover:text-text-main transition-colors"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">{project.title}</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-elevated text-text-muted">
              {project.status}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            {projectCategory?.name || 'عمومی'}
            {project.deadlineDate ? ` • مهلت: ${project.deadlineDate}` : ''}
          </p>
        </div>
      </div>

      {project.description && (
        <div className="p-4 rounded-xl bg-surface border border-border-subtle text-sm text-text-main">
          {project.description}
        </div>
      )}

      {/* Progress Metric */}
      <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-sm space-y-2">
        <div className="flex justify-between text-xs font-semibold">
          <span>پیشرفت وظایف پروژه</span>
          <span>
            {doneCount} از {projectTasks.length} ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2 bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-status-complete rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Two-Level Task Checklist */}
      <div className="p-5 rounded-xl bg-surface border border-border-subtle shadow-sm space-y-4">
        <h2 className="text-base font-bold text-text-main">وظایف و زیروظایف (Tasks & Subtasks)</h2>
        <TaskChecklist projectId={id} tasks={projectTasks} />
      </div>
    </div>
  );
}
