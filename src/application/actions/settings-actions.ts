'use server';

import { db, sqlite } from '@/db/client';
import { appPreferences, categories } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

export async function updatePreferencesAction(formData: FormData) {
  const uiLocale = (formData.get('uiLocale') as string) || 'fa';
  const calendarSystem = (formData.get('calendarSystem') as string) || 'persian';
  const dayRolloverHour = Number(formData.get('dayRolloverHour') || 4);
  const theme = ((formData.get('theme') as string) || 'system') as
    | 'light'
    | 'dark'
    | 'sepia'
    | 'oled'
    | 'system';
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

  revalidatePath('/', 'layout');
  revalidatePath('/settings');
  revalidatePath('/today');
}

export async function updateThemeAction(theme: 'light' | 'dark' | 'sepia' | 'oled' | 'system') {
  const now = new Date().toISOString();
  db.update(appPreferences)
    .set({
      theme,
      updatedAt: now,
    })
    .where(eq(appPreferences.id, 1))
    .run();

  revalidatePath('/', 'layout');
  revalidatePath('/settings');
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

export async function deleteCategoryAction(categoryId: string, targetCategoryIdToReassign?: string) {
  const allCats = sqlite.prepare('SELECT id FROM categories WHERE is_archived = 0').all() as Array<{ id: string }>;
  if (allCats.length <= 1) {
    throw new Error('حداقل یک دسته‌بندی در برنامه باید فعال باشد.');
  }

  const fallbackId = targetCategoryIdToReassign || allCats.find((c) => c.id !== categoryId)?.id;
  if (!fallbackId) {
    throw new Error('دسته‌بندی جایگزین برای انتقال آیتم‌ها یافت نشد.');
  }

  sqlite.transaction(() => {
    // Reassign items safely to avoid FOREIGN KEY constraint error
    sqlite.prepare('UPDATE habits SET category_id = ? WHERE category_id = ?').run(fallbackId, categoryId);
    sqlite.prepare('UPDATE goals SET category_id = ? WHERE category_id = ?').run(fallbackId, categoryId);
    sqlite.prepare('UPDATE projects SET category_id = ? WHERE category_id = ?').run(fallbackId, categoryId);
    sqlite.prepare('UPDATE study_sessions SET category_id = ? WHERE category_id = ?').run(fallbackId, categoryId);
    sqlite.prepare('UPDATE knowledge_notes SET area_id = ? WHERE area_id = ?').run(fallbackId, categoryId);
    sqlite.prepare('UPDATE practice_logs SET area_id = ? WHERE area_id = ?').run(fallbackId, categoryId);

    // Delete category
    sqlite.prepare('DELETE FROM categories WHERE id = ?').run(categoryId);
  })();

  revalidatePath('/settings');
  revalidatePath('/today');
  revalidatePath('/habits');
  revalidatePath('/goals');
  revalidatePath('/projects');
  revalidatePath('/focus');
  revalidatePath('/vault');
  return { success: true };
}
