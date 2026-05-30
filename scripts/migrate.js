const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../src/config/database');
const logger = require('../src/utils/logger');

async function runMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/001_init_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    logger.info('Running migrations...');

    // Execute the migration
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: migrationSQL,
    });

    if (error) {
      // If RPC not available, we'll try direct execution
      logger.warn('RPC method not available, trying direct execution');
      logger.info('Please run the SQL in migrations/001_init_schema.sql manually in Supabase dashboard');
      logger.info('Go to: SQL Editor > New Query > Copy & paste the SQL > Run');
    } else {
      logger.info('✅ Migrations completed successfully');
    }
  } catch (error) {
    logger.error('Migration error:', error);
    process.exit(1);
  }
}

runMigration();
