'use server';

import { db } from '@/db/client';
import { appPreferences, categories } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

export async function updatePreferencesAction(formData: FormData) {
  const uiLocale = (formData.get('uiLocale') as string) || 'fa';
  const calendarSystem = (formData.get('calendarSystem') as string) || 'persian';
  const dayRolloverHour = Number(formData.get('dayRolloverHour') || 4);
  const theme = (formData.get('theme') as string) || 'system';
  const now = new Date().toISOString();

  db.update(appPreferences)
    .set({
      uiLocale,
      calendarSystem,
      dayRolloverHour,
      theme,
      updatedAt: now,
    })
    .where(eq(appPreferences.id, 1))
    .run();

  revalidatePath('/settings');
  revalidatePath('/today');
}

export async function createCategoryAction(formData: FormData) {
  const name = formData.get('name') as string;
  const colorHex = (formData.get('colorHex') as string) || '#2563EB';
  const iconName = (formData.get('iconName') as string) || 'Folder';

  if (!name) throw new Error('Name is required');

  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const now = new Date().toISOString();

  db.insert(categories).values({
    id: `cat_${Date.now()}`,
    name,
    slug,
    colorHex,
    iconName,
    sortOrder: 10,
    isArchived: 0,
    createdAt: now,
    updatedAt: now,
  }).run();

  revalidatePath('/settings');
  revalidatePath('/today');
}
