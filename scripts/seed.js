const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'daymark.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

const schemaSql = fs.readFileSync(path.join(__dirname, '..', 'src', 'db', 'schema.sql'), 'utf8');
const seedSql = fs.readFileSync(path.join(__dirname, '..', 'src', 'db', 'seed.sql'), 'utf8');

db.exec(schemaSql);
db.exec(seedSql);

console.log('✅ SQLite database initialized and seeded at:', dbPath);
