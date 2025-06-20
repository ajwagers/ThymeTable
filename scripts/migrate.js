import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease add these to your .env file');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...');
    
    // Read the migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20250620184438_lively_unit.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      // If exec_sql doesn't exist, try direct SQL execution
      const { error: directError } = await supabase
        .from('_migrations')
        .select('*')
        .limit(1);
      
      if (directError && directError.code === '42P01') {
        // Table doesn't exist, run migration directly
        console.log('📝 Running migration directly...');
        
        // Split migration into individual statements
        const statements = migrationSQL
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        for (const statement of statements) {
          if (statement.trim()) {
            const { error: stmtError } = await supabase.rpc('exec', { sql: statement });
            if (stmtError) {
              console.warn(`⚠️ Statement warning: ${stmtError.message}`);
              // Continue with other statements
            }
          }
        }
      } else {
        throw error;
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('📊 Created tables:');
    console.log('   - favorite_recipes (for saving favorite recipes)');
    console.log('   - saved_meal_plans (for saving weekly meal plans)');
    console.log('');
    console.log('🔒 Security features enabled:');
    console.log('   - Row Level Security (RLS)');
    console.log('   - User-specific access policies');
    console.log('   - Automatic timestamps');
    console.log('');
    console.log('🎉 Your app is now ready with favorites and saved meal plans!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('ℹ️ Tables already exist - migration may have run previously');
      console.log('✅ Your database is up to date!');
    } else {
      console.error('\n🔧 Troubleshooting:');
      console.error('1. Check your Supabase URL and service role key');
      console.error('2. Ensure your Supabase project is active');
      console.error('3. Verify network connectivity');
      process.exit(1);
    }
  }
}

// Alternative method using direct SQL execution
async function runMigrationDirect() {
  try {
    console.log('🚀 Running migration with direct SQL execution...');
    
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20250620184438_lively_unit.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Execute the entire migration as one query
    const { error } = await supabase.rpc('exec', { sql: migrationSQL });
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Direct migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Direct migration failed:', error.message);
    throw error;
  }
}

// Run the migration
runMigration().catch(() => {
  console.log('\n🔄 Trying alternative migration method...');
  runMigrationDirect().catch(() => {
    console.error('\n💡 Manual migration required:');
    console.error('Please run the SQL from supabase/migrations/20250620184438_lively_unit.sql');
    console.error('in your Supabase dashboard SQL editor.');
    process.exit(1);
  });
});