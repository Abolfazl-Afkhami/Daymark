import fs from 'fs';
import path from 'path';
import { sqlite } from './client';

export function initializeDatabase() {
  const schemaPath = path.join(process.cwd(), 'src', 'db', 'schema.sql');
  const seedPath = path.join(process.cwd(), 'src', 'db', 'seed.sql');

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const seedSql = fs.readFileSync(seedPath, 'utf8');

  sqlite.exec(schemaSql);
  sqlite.exec(seedSql);

  console.log('Database initialized and seeded successfully.');
}

if (require.main === module || process.argv[1]?.endsWith('init.ts')) {
  initializeDatabase();
}
