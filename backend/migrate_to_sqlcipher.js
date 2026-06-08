/**
 * migrate_to_sqlcipher.js
 *
 * One-time migration: reads the existing plain-text courier.db,
 * creates an encrypted courier_encrypted.db via SQLCipher,
 * copies every table + row, then renames files so the app
 * picks up the encrypted database transparently.
 *
 * Usage:  node migrate_to_sqlcipher.js
 *
 * Requirements:
 *   - npm install @journeyapps/sqlcipher dotenv
 *   - .env file with DB_ENCRYPTION_KEY set
 */

require('dotenv').config();
const sqlcipher = require('@journeyapps/sqlcipher').verbose();
const sqlite3   = require('sqlite3').verbose();
const path      = require('path');
const fs        = require('fs');

const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  console.error('❌  DB_ENCRYPTION_KEY is not set in .env — aborting.');
  process.exit(1);
}

const PLAIN_DB_PATH     = path.resolve(__dirname, 'courier.db');
const ENCRYPTED_DB_PATH = path.resolve(__dirname, 'courier_encrypted.db');
const BACKUP_DB_PATH    = path.resolve(__dirname, 'courier_plain_backup.db');

// ── Promisified helpers ──────────────────────────────────────────────

const promisify = (db) => {
  db.allAsync = (sql, params = []) =>
    new Promise((resolve, reject) =>
      db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
    );
  db.runAsync = (sql, params = []) =>
    new Promise((resolve, reject) =>
      db.run(sql, params, function (err) {
        err ? reject(err) : resolve({ lastID: this.lastID, changes: this.changes });
      })
    );
  db.execAsync = (sql) =>
    new Promise((resolve, reject) =>
      db.exec(sql, (err) => (err ? reject(err) : resolve()))
    );
  db.getAsync = (sql, params = []) =>
    new Promise((resolve, reject) =>
      db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)))
    );
  return db;
};

// ── Main ─────────────────────────────────────────────────────────────

(async () => {
  console.log('🔄  Starting SQLCipher migration …');

  // 1 — Open plain database (read-only)
  if (!fs.existsSync(PLAIN_DB_PATH)) {
    console.error(`❌  Source database not found: ${PLAIN_DB_PATH}`);
    process.exit(1);
  }

  // Delete any leftover encrypted DB from a previous failed run
  if (fs.existsSync(ENCRYPTED_DB_PATH)) {
    fs.unlinkSync(ENCRYPTED_DB_PATH);
  }

  const srcDb = promisify(new sqlite3.Database(PLAIN_DB_PATH, sqlite3.OPEN_READONLY));
  const dstDb = promisify(new sqlcipher.Database(ENCRYPTED_DB_PATH));

  // 2 — Set encryption key on the destination
  await dstDb.runAsync(`PRAGMA key = '${ENCRYPTION_KEY}'`);
  await dstDb.runAsync('PRAGMA cipher_compatibility = 4');

  // 3 — Read all table schemas from the source
  const tables = await srcDb.allAsync(
    `SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
  );

  console.log(`   Found ${tables.length} tables to migrate.`);

  // 4 — Recreate tables in the encrypted DB
  for (const t of tables) {
    await dstDb.execAsync(t.sql);
    console.log(`   ✅  Created table: ${t.name}`);
  }

  // 5 — Copy data table-by-table
  for (const t of tables) {
    const rows = await srcDb.allAsync(`SELECT * FROM "${t.name}"`);
    if (rows.length === 0) {
      console.log(`   ⏭️   ${t.name}: 0 rows (skipped)`);
      continue;
    }

    const cols = Object.keys(rows[0]);
    const placeholders = cols.map(() => '?').join(', ');
    const insertSql = `INSERT INTO "${t.name}" (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`;

    await dstDb.execAsync('BEGIN TRANSACTION');
    for (const row of rows) {
      await dstDb.runAsync(insertSql, cols.map(c => row[c]));
    }
    await dstDb.execAsync('COMMIT');

    console.log(`   ✅  ${t.name}: ${rows.length} rows copied`);
  }

  // 6 — Copy indexes
  const indexes = await srcDb.allAsync(
    `SELECT sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL`
  );
  for (const idx of indexes) {
    try {
      await dstDb.execAsync(idx.sql);
    } catch (_) { /* index may already exist from CREATE TABLE UNIQUE constraints */ }
  }
  console.log(`   ✅  ${indexes.length} indexes copied`);

  // 7 — Verify encrypted DB is readable with the key
  const verifyCount = await dstDb.getAsync('SELECT count(*) as cnt FROM users');
  console.log(`   🔑  Verification: users table has ${verifyCount.cnt} row(s) in encrypted DB`);

  // 8 — Close both databases
  await new Promise(r => srcDb.close(r));
  await new Promise(r => dstDb.close(r));

  // 9 — Rename files: plain → backup, encrypted → courier.db
  fs.renameSync(PLAIN_DB_PATH, BACKUP_DB_PATH);
  fs.renameSync(ENCRYPTED_DB_PATH, PLAIN_DB_PATH);

  console.log('');
  console.log('✅  Migration complete!');
  console.log(`   📁  Encrypted DB:   ${PLAIN_DB_PATH}`);
  console.log(`   📁  Plain backup:   ${BACKUP_DB_PATH}`);
  console.log('');
  console.log('   The app will now use the encrypted database automatically.');
  console.log('   Delete courier_plain_backup.db once you\'re satisfied everything works.');
})();
