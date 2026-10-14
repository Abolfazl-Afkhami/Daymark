// src/app/(dashboard)/vault/page.tsx
import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { StudyService } from '@/application/services/study-service';
import { getLogicalToday } from '@/domain/calendar/civil-date';
import { VaultClient } from '@/components/study/VaultClient';

export const dynamic = 'force-dynamic';

export default async function VaultPage() {
  const todayCivilDate = getLogicalToday(new Date(), 'Asia/Tehran', 4);
  const allCategories = await db.select().from(categories).all();

  const notes = StudyService.searchKnowledgeNotes();
  const dueReviews = StudyService.getDueReviews(todayCivilDate);
  const allReviews = StudyService.getAllReviews();
  const practiceLogs = StudyService.getPracticeLogs(50);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-main">
          خزانه دانش و یادگیری‌های فنی (Knowledge Vault)
        </h1>
        <p className="text-sm text-text-muted mt-1">
          مدیریت نکات امروز چه یاد گرفتم (TIL)، مرور با فاصله (SM-2) و تحلیل جامع تست‌زنی و حل مسئله
        </p>
      </div>

      <VaultClient
        initialNotes={notes}
        dueReviews={dueReviews}
        allReviews={allReviews}
        practiceLogs={practiceLogs}
        categories={allCategories.map((c) => ({ id: c.id, name: c.name }))}
        todayCivilDate={todayCivilDate}
      />
    </div>
  );
}
