const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database path - always use absolute path to avoid directory issues
const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.resolve(__dirname, 'superfeynman.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1); // Exit if database connection fails
  } else {
    console.log('✓ Connected to SQLite database at:', dbPath);
  }
});

/**
 * Enable foreign key constraints and verify they're working
 * This is critical for CASCADE deletes to work properly
 */
async function enableForeignKeys() {
  return new Promise((resolve, reject) => {
    db.run('PRAGMA foreign_keys = ON', (err) => {
      if (err) {
        reject(new Error('Failed to enable foreign keys: ' + err.message));
      } else {
        // Verify foreign keys are actually enabled
        db.get('PRAGMA foreign_keys', (err, row) => {
          if (err) {
            reject(new Error('Failed to verify foreign keys: ' + err.message));
          } else if (row.foreign_keys !== 1) {
            reject(new Error('Foreign keys are not enabled'));
          } else {
            console.log('✓ Foreign key constraints enabled');
            resolve();
          }
        });
      }
    });
  });
}

// Enable foreign keys immediately
enableForeignKeys().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});

/**
 * Initialize database with schema
 * @returns {Promise<void>}
 */
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    db.exec(schema, (err) => {
      if (err) {
        console.error('❌ Error initializing database:', err);
        reject(err);
      } else {
        console.log('✓ Database initialized successfully');
        resolve();
      }
    });
  });
}

/**
 * Promisified query method for SELECT statements
 * @param {string} sql - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise<array>} Query results
 */
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Promisified run method for INSERT, UPDATE, DELETE statements
 * @param {string} sql - SQL statement
 * @param {array} params - Statement parameters
 * @returns {Promise<object>} Result with lastID and changes
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          lastID: this.lastID,
          changes: this.changes
        });
      }
    });
  });
}

/**
 * Promisified get method for single row SELECT
 * @param {string} sql - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise<object>} Single row result
 */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Gracefully close database connection
 * @returns {Promise<void>}
 */
function close() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        console.log('✓ Database connection closed');
        resolve();
      }
    });
  });
}

module.exports = {
  db,
  initializeDatabase,
  query,
  run,
  get,
  close
};
