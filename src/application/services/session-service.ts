// src/application/services/session-service.ts
import { db } from '@/db/client';
import { studySessions } from '@/db/schema';
import { checkIntervalOverlap } from '@/domain/sessions/overlap';

export class SessionService {
  static async logSession(input: typeof studySessions.$inferInsert) {
    return db.insert(studySessions).values(input);
  }
}
