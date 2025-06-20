import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
config({ path: join(__dirname, '..', '.env') });

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Environment check:');
console.log(`   VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Found' : '❌ Missing'}`);
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Found' : '❌ Missing'}`);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ Missing required environment variables:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease add these to your .env file');
  console.error('\n📋 Example .env file:');
  console.error('VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('VITE_SUPABASE_ANON_KEY=your_anon_key');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.error('VITE_SPOONACULAR_API_KEY=your_spoonacular_key');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkConnection() {
  try {
    const { data, error } = await supabase.from('_supabase_migrations').select('*').limit(1);
    if (error && error.code !== '42P01') {
      throw error;
    }
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

async function runMigration() {
  try {
    console.log('\n🚀 Starting database migration...');
    
    // Test connection first
    console.log('🔗 Testing Supabase connection...');
    const connected = await checkConnection();
    if (!connected) {
      throw new Error('Failed to connect to Supabase');
    }
    console.log('✅ Connected to Supabase successfully');
    
    // Read the migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20250620184438_lively_unit.sql');
    console.log(`📖 Reading migration file: ${migrationPath}`);
    
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    console.log(`📝 Migration file loaded (${migrationSQL.length} characters)`);
    
    // Split migration into individual statements and execute them
    console.log('🔄 Executing migration statements...');
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== '');
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let skipCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`   Executing statement ${i + 1}/${statements.length}...`);
          
          // Use the SQL editor endpoint for direct execution
          const { error } = await supabase.rpc('exec', { 
            sql: statement + ';' 
          });
          
          if (error) {
            // Check if it's a "already exists" error, which we can safely ignore
            if (error.message.includes('already exists') || 
                error.message.includes('duplicate key') ||
                error.code === '42P07' || // relation already exists
                error.code === '42710') { // object already exists
              console.log(`   ⚠️ Skipped (already exists): ${error.message.split('\n')[0]}`);
              skipCount++;
            } else {
              console.error(`   ❌ Error in statement ${i + 1}:`, error.message);
              throw error;
            }
          } else {
            successCount++;
          }
        } catch (stmtError) {
          console.error(`   ❌ Failed to execute statement ${i + 1}:`, stmtError.message);
          throw stmtError;
        }
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log(`📊 Results: ${successCount} executed, ${skipCount} skipped (already existed)`);
    console.log('');
    console.log('📋 Database schema updated:');
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
    console.error('\n❌ Migration failed:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('ℹ️ Tables already exist - migration may have run previously');
      console.log('✅ Your database is up to date!');
      return;
    }
    
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check your VITE_SUPABASE_URL in .env file');
    console.error('2. Check your SUPABASE_SERVICE_ROLE_KEY in .env file');
    console.error('3. Ensure your Supabase project is active');
    console.error('4. Verify network connectivity');
    console.error('\n💡 Manual migration option:');
    console.error('If automatic migration continues to fail, you can:');
    console.error('1. Go to your Supabase dashboard');
    console.error('2. Navigate to SQL Editor');
    console.error('3. Copy and paste the contents of supabase/migrations/20250620184438_lively_unit.sql');
    console.error('4. Run the SQL manually');
    
    process.exit(1);
  }
}

// Run the migration
console.log('🏁 ThymeTable Database Migration');
console.log('================================');
runMigration();