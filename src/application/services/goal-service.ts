// src/application/services/goal-service.ts
import { db } from '@/db/client';
import { goals } from '@/db/schema';
import { eq } from 'drizzle-orm';

export class GoalService {
  static async getGoal(goalId: string) {
    return db.query.goals.findFirst({
      where: eq(goals.id, goalId),
    });
  }
}
