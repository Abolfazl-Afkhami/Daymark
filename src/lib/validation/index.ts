// src/lib/validation/index.ts
import { z } from 'zod';

export const CivilDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD');

export const HabitStatusSchema = z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']);
export const HabitTypeSchema = z.enum(['BINARY', 'QUANTITATIVE']);
export const ScheduleTypeSchema = z.enum(['DAILY', 'WEEKDAYS', 'WEEKLY_TARGET', 'INTERVAL']);
export const HabitLogStatusSchema = z.enum(['COMPLETED', 'PARTIAL', 'SKIPPED', 'MISSED']);

export const HabitFormSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  iconName: z.string().default('Folder'),
  habitType: HabitTypeSchema,
  startDate: CivilDateSchema,
  endDate: CivilDateSchema.optional().nullable(),
  reminderTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  scheduleType: ScheduleTypeSchema,
  weekdaysMask: z.number().int().min(1).max(127).optional().nullable(),
  weeklyTargetCount: z.number().int().min(1).max(7).optional().nullable(),
  intervalDays: z.number().int().min(2).max(365).optional().nullable(),
  targetValue: z.number().positive().optional().nullable(),
  targetUnit: z.string().optional().nullable(),
});

export const StudySessionSchema = z.object({
  categoryId: z.string().min(1),
  projectId: z.string().optional().nullable(),
  goalId: z.string().optional().nullable(),
  subjectTag: z.string().optional(),
  sessionType: z.enum(['STUDY', 'PRACTICE_QUESTIONS', 'ERROR_REVIEW', 'CODING', 'RESEARCH', 'MOCK_EXAM']),
  sessionDate: CivilDateSchema,
  startTimeUtc: z.string().datetime(),
  endTimeUtc: z.string().datetime(),
  timeZone: z.string().min(1),
  durationMinutes: z.number().int().min(1).max(960),
  questionsCompleted: z.number().int().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
  isConcurrentOverlap: z.number().int().min(0).max(1).default(0),
});

export const BackupArchiveSchema = z.object({
  schemaVersion: z.enum(['1.0.0', '1.1.2']),
  exportedAtUtc: z.string().datetime(),
  preferences: z.any().optional(),
  categories: z.array(z.any()),
  habits: z.array(z.any()),
  habitScheduleVersions: z.array(z.any()).optional().default([]),
  habitPausePeriods: z.array(z.any()).optional().default([]),
  habitLogs: z.array(z.any()).optional().default([]),
  goals: z.array(z.any()).optional().default([]),
  projects: z.array(z.any()).optional().default([]),
  tasks: z.array(z.any()).optional().default([]),
  studySessions: z.array(z.any()).optional().default([]),
  knowledgeNotes: z.array(z.any()).optional().default([]),
  studyReviews: z.array(z.any()).optional().default([]),
  practiceLogs: z.array(z.any()).optional().default([]),
  mockExams: z.array(z.any()).optional().default([]),
  mockExamSubjects: z.array(z.any()).optional().default([]),
});
