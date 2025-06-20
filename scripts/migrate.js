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
    // Simple connection test - try to query the auth.users table
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error && !error.message.includes('JWT')) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

async function tableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .single();
    
    return !error && data;
  } catch (error) {
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
    
    // Check if tables already exist
    console.log('🔍 Checking existing database schema...');
    const favoritesExists = await tableExists('favorite_recipes');
    const mealPlansExists = await tableExists('saved_meal_plans');
    
    if (favoritesExists && mealPlansExists) {
      console.log('✅ Database tables already exist - migration previously completed');
      console.log('📊 Found tables:');
      console.log('   - favorite_recipes ✅');
      console.log('   - saved_meal_plans ✅');
      console.log('');
      console.log('🎉 Your database is ready to use!');
      return;
    }
    
    // Read the migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20250620184438_lively_unit.sql');
    console.log(`📖 Reading migration file: ${migrationPath}`);
    
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    console.log(`📝 Migration file loaded (${migrationSQL.length} characters)`);
    
    console.log('\n⚠️ Automatic SQL execution is not available.');
    console.log('Please run the migration manually using one of these methods:');
    console.log('');
    console.log('🔧 Method 1 - Supabase Dashboard (Recommended):');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Create a new query');
    console.log('5. Copy and paste the contents of: supabase/migrations/20250620184438_lively_unit.sql');
    console.log('6. Click "Run" to execute the migration');
    console.log('');
    console.log('🔧 Method 2 - Supabase CLI (if installed):');
    console.log('1. Run: supabase db reset');
    console.log('2. Or: supabase migration up');
    console.log('');
    console.log('📄 Migration file location:');
    console.log(`   ${migrationPath}`);
    console.log('');
    console.log('✨ After running the migration, your app will have:');
    console.log('   - Favorites system for saving recipes');
    console.log('   - Saved meal plans for reusing weekly plans');
    console.log('   - Row Level Security for user data protection');
    
  } catch (error) {
    console.error('\n❌ Migration setup failed:', error.message);
    
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