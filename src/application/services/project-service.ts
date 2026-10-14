import { db } from '@/db/client';
import { projects, tasks } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export class ProjectService {
  static async getAllProjects() {
    return db.select().from(projects).orderBy(desc(projects.createdAt)).all();
  }

  static async getProjectById(id: string) {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
    });

    if (!project) return null;

    const projectTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, id))
      .orderBy(tasks.sortOrder)
      .all();

    return {
      ...project,
      tasks: projectTasks,
    };
  }

  static async createProject(data: typeof projects.$inferInsert) {
    return db.insert(projects).values(data).returning().get();
  }

  static async updateProjectStatus(id: string, status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'ARCHIVED') {
    const now = new Date().toISOString();
    return db
      .update(projects)
      .set({ status, updatedAt: now })
      .where(eq(projects.id, id))
      .run();
  }

  static async createTask(data: typeof tasks.$inferInsert) {
    return db.insert(tasks).values(data).returning().get();
  }

  static async updateTaskStatus(taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED') {
    const now = new Date().toISOString();
    const completedAt = status === 'DONE' ? now : null;
    return db
      .update(tasks)
      .set({ status, completedAt, updatedAt: now })
      .where(eq(tasks.id, taskId))
      .run();
  }
}
