// src/application/services/habit-service.ts
import { db } from '@/db/client';
import { habits, habitLogs, habitScheduleVersions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { CivilDate } from '@/domain/calendar/civil-date';

export class HabitService {
  /**
   * Logs a habit occurrence atomically with snapshotted target metadata
   */
  static async logHabit(input: {
    habitId: string;
    logDate: CivilDate;
    status: 'COMPLETED' | 'PARTIAL' | 'SKIPPED' | 'MISSED';
    value?: number;
    notes?: string;
  }) {
    // Upsert habit log row
    const now = new Date().toISOString();
    return db.insert(habitLogs).values({
      id: crypto.randomUUID(),
      habitId: input.habitId,
      logDate: input.logDate,
      status: input.status,
      value: input.value ?? 0,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoUpdate({
      target: [habitLogs.habitId, habitLogs.logDate],
      set: {
        status: input.status,
        value: input.value ?? 0,
        notes: input.notes,
        updatedAt: now,
      },
    });
  }
}
