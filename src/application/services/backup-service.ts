// src/application/services/backup-service.ts
import { sqlite } from '@/db/client';
import fs from 'fs';
import path from 'path';

export class BackupService {
  /**
   * Executes atomic SQLite VACUUM INTO backup snapshot
   */
  static async backupSqlite(destinationPath: string) {
    if (fs.existsSync(destinationPath)) {
      fs.unlinkSync(destinationPath);
    }
    sqlite.pragma('wal_checkpoint(PASSIVE)');
    sqlite.exec(`VACUUM INTO '${destinationPath}'`);
  }
}
