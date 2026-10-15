// src/domain/category/constants.ts

/**
 * ۴ دسته‌بندی پایه و غیرقابل‌حذف سیستم (Single Source of Truth)
 * تمام ماژول‌های کلاینتی و سروری شناسه دسته‌های سیستمی را از این ماژول دریافت می‌کنند.
 */
export const SYSTEM_CATEGORY_IDS = new Set<string>([
  'cat_academic',
  'cat_ai',
  'cat_programming',
  'cat_personal',
]);

export function isSystemCategory(categoryId: string): boolean {
  return SYSTEM_CATEGORY_IDS.has(categoryId);
}
