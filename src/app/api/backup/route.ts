import { NextResponse } from 'next/server';
import { db } from '@/db/client';
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

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const preferences = await db.select().from(appPreferences).all();
    const allCategories = await db.select().from(categories).all();
    const allHabits = await db.select().from(habits).all();
    const allVersions = await db.select().from(habitScheduleVersions).all();
    const allPauses = await db.select().from(habitPausePeriods).all();
    const allLogs = await db.select().from(habitLogs).all();
    const allGoals = await db.select().from(goals).all();
    const allProjects = await db.select().from(projects).all();
    const allTasks = await db.select().from(tasks).all();
    const allSessions = await db.select().from(studySessions).all();

    const backupPayload = {
      schemaVersion: '1.0.0',
      exportedAtUtc: new Date().toISOString(),
      preferences: preferences[0] || null,
      categories: allCategories,
      habits: allHabits,
      habitScheduleVersions: allVersions,
      habitPausePeriods: allPauses,
      habitLogs: allLogs,
      goals: allGoals,
      projects: allProjects,
      tasks: allTasks,
      studySessions: allSessions,
    };

    return new NextResponse(JSON.stringify(backupPayload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="daymark-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error('Backup Error:', error);
    return NextResponse.json({ error: 'Failed to generate backup' }, { status: 500 });
  }
}
