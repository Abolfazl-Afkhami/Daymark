// src/application/actions/study-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { StudyService } from '../services/study-service';
import { ReviewQuality } from '@/domain/study/study-engine';

export async function createReviewAction(
  title: string,
  todayCivilDate: string,
  areaId?: string,
  projectId?: string
) {
  if (!title.trim()) return;
  StudyService.createReviewItem(title, todayCivilDate, areaId, projectId);
  revalidatePath('/today');
  revalidatePath('/vault');
}

export async function gradeReviewAction(
  id: string,
  quality: ReviewQuality,
  todayCivilDate: string
) {
  StudyService.submitReviewGrade(id, quality, todayCivilDate);
  revalidatePath('/today');
  revalidatePath('/vault');
}

export async function deleteReviewAction(id: string) {
  StudyService.deleteReviewItem(id);
  revalidatePath('/today');
  revalidatePath('/vault');
}

export async function createReviewItemAction(params: {
  title: string;
  areaId?: string;
  projectId?: string;
}) {
  const today = new Date().toISOString().slice(0, 10);
  return createReviewAction(params.title, today, params.areaId, params.projectId);
}

export async function submitReviewQualityAction(id: string, quality: ReviewQuality) {
  const today = new Date().toISOString().slice(0, 10);
  return gradeReviewAction(id, quality, today);
}

export async function addKnowledgeNoteAction(formData: FormData) {
  const title = String(formData.get('title') ?? '');
  const content = String(formData.get('content') ?? '');
  const language = String(formData.get('language') ?? 'markdown');
  const rawTags = String(formData.get('tags') ?? '');
  const areaId = (formData.get('areaId') as string) || undefined;
  const civilDate =
    String(formData.get('civilDate') ?? '') || new Date().toISOString().slice(0, 10);

  if (!title.trim() || !content.trim()) return;

  const tags = rawTags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  StudyService.addKnowledgeNote({
    title,
    content,
    language,
    tags,
    areaId,
    civilDate,
  });

  revalidatePath('/vault');
}

export async function deleteKnowledgeNoteAction(id: string) {
  StudyService.deleteKnowledgeNote(id);
  revalidatePath('/vault');
}

export async function togglePinNoteAction(id: string) {
  StudyService.togglePinKnowledgeNote(id);
  revalidatePath('/vault');
}

export async function logPracticeTestAction(formData: FormData) {
  const topic = String(formData.get('topic') ?? '');
  const totalQuestions = Number(formData.get('totalQuestions') ?? 0);
  const correctCount = Number(formData.get('correctCount') ?? 0);
  const wrongCount = Number(formData.get('wrongCount') ?? 0);
  const durationMinutes = Number(formData.get('durationMinutes') ?? 0);
  const civilDate =
    String(formData.get('civilDate') ?? '') || new Date().toISOString().slice(0, 10);
  const areaId = (formData.get('areaId') as string) || undefined;

  if (!topic.trim() || totalQuestions <= 0) return;

  StudyService.logPracticeTest({
    topic,
    totalQuestions,
    correctCount,
    wrongCount,
    durationMinutes,
    civilDate,
    areaId,
  });

  revalidatePath('/analytics');
  revalidatePath('/today');
  revalidatePath('/vault');
}
