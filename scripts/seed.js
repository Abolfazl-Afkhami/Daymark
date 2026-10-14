const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'daymark.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

const schemaPath = path.join(__dirname, '..', 'src', 'db', 'schema.sql');
const seedPath = path.join(__dirname, '..', 'src', 'db', 'seed.sql');

if (!fs.existsSync(schemaPath) || !fs.existsSync(seedPath)) {
  console.error('Error: schema.sql or seed.sql not found in src/db/');
  process.exit(1);
}

const schemaSql = fs.readFileSync(schemaPath, 'utf8');
const seedSql = fs.readFileSync(seedPath, 'utf8');

// Execute within a single atomic transaction
const seedTransaction = db.transaction(() => {
  db.exec(schemaSql);
  db.exec(seedSql);
});

try {
  seedTransaction();
  console.log('✅ SQLite database atomically initialized and seeded at:', dbPath);
} catch (error) {
  console.error('❌ Failed to seed database:', error);
  process.exit(1);
}
