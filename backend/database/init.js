#!/usr/bin/env node

/**
 * Database Initialization Script
 * Initializes the database with the schema and verifies the structure
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { initializeDatabase, query, close } = require('./db');
const path = require('path');

async function init() {
  try {
    console.log('Starting database initialization...');
    const dbPath = process.env.DATABASE_PATH
      ? path.resolve(process.env.DATABASE_PATH)
      : path.resolve(__dirname, 'superfeynman.db');
    console.log('Database path:', dbPath);
    console.log('');

    // Initialize the database with schema
    await initializeDatabase();

    console.log('\nVerifying database structure...');

    // Check tables
    const tables = await query(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );

    console.log('\nTables created:');
    tables.forEach(table => {
      console.log('  -', table.name);
    });

    // Check indexes
    const indexes = await query(
      "SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );

    console.log('\nIndexes created:');
    indexes.forEach(index => {
      console.log('  -', index.name);
    });

    console.log('\n✅ Database initialization complete!');
    console.log('\nYou can now:');
    console.log('  1. Start the server: npm run dev');
    console.log('  2. Inspect the database with SQLite browser');

  } catch (error) {
    console.error('\n❌ Error during initialization:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    try {
      await close();
    } catch (error) {
      console.error('Error closing database:', error);
    }
    process.exit(0);
  }
}

init();
