import { NextResponse } from 'next/server';
import { db, sqlite } from '@/db/client';
import {
  appPreferences,
  categories,
  habits,
  habitScheduleVersions,
  habitPausePeriods,
  habitLogs,
  goals,
  projects,
  tasks,
  studySessions,
} from '@/db/schema';
import { BackupArchiveSchema } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = BackupArchiveSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid backup format', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Execute atomic restore transaction in reverse FK order
    const restoreTx = sqlite.transaction(() => {
      sqlite.exec('DELETE FROM study_sessions;');
      sqlite.exec('DELETE FROM tasks;');
      sqlite.exec('DELETE FROM projects;');
      sqlite.exec('DELETE FROM goals;');
      sqlite.exec('DELETE FROM habit_logs;');
      sqlite.exec('DELETE FROM habit_pause_periods;');
      sqlite.exec('DELETE FROM habit_schedule_versions;');
      sqlite.exec('DELETE FROM habits;');
      sqlite.exec('DELETE FROM categories;');

      if (data.categories?.length) {
        for (const cat of data.categories) {
          db.insert(categories).values(cat).run();
        }
      }

      if (data.habits?.length) {
        for (const h of data.habits) {
          db.insert(habits).values(h).run();
        }
      }

      if (data.habitScheduleVersions?.length) {
        for (const v of data.habitScheduleVersions) {
          db.insert(habitScheduleVersions).values(v).run();
        }
      }

      if (data.habitPausePeriods?.length) {
        for (const p of data.habitPausePeriods) {
          db.insert(habitPausePeriods).values(p).run();
        }
      }

      if (data.habitLogs?.length) {
        for (const l of data.habitLogs) {
          db.insert(habitLogs).values(l).run();
        }
      }

      if (data.goals?.length) {
        for (const g of data.goals) {
          db.insert(goals).values(g).run();
        }
      }

      if (data.projects?.length) {
        for (const p of data.projects) {
          db.insert(projects).values(p).run();
        }
      }

      if (data.tasks?.length) {
        for (const t of data.tasks) {
          db.insert(tasks).values(t).run();
        }
      }

      if (data.studySessions?.length) {
        for (const s of data.studySessions) {
          db.insert(studySessions).values(s).run();
        }
      }

      sqlite.pragma('foreign_key_check');
    });

    restoreTx();

    return NextResponse.json({ success: true, message: 'Restore completed successfully' });
  } catch (error) {
    console.error('Restore Error:', error);
    return NextResponse.json({ error: 'Failed to restore backup archive' }, { status: 500 });
  }
}
