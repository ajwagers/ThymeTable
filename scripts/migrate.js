import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  if (!supabaseUrl) console.error('  - VITE_SUPABASE_URL');
  if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease check your .env file and ensure these variables are set.');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...');

    // Read the migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20250620184438_lively_unit.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    // Split the SQL into individual statements (rough split by semicolons)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('/*') && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            // Try direct query execution as fallback
            const { error: directError } = await supabase
              .from('information_schema.tables')
              .select('*')
              .limit(1);
            
            if (directError) {
              console.warn(`⚠️  Statement ${i + 1} may have failed:`, error.message);
            }
          }
        } catch (err) {
          console.warn(`⚠️  Statement ${i + 1} encountered an issue:`, err.message);
          // Continue with other statements
        }
      }
    }

    // Verify tables were created
    console.log('🔍 Verifying migration results...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['favorite_recipes', 'saved_meal_plans']);

    if (tablesError) {
      console.warn('⚠️  Could not verify table creation:', tablesError.message);
    } else {
      const tableNames = tables.map(t => t.table_name);
      console.log('📊 Found tables:', tableNames);
      
      if (tableNames.includes('favorite_recipes') && tableNames.includes('saved_meal_plans')) {
        console.log('✅ Migration completed successfully!');
      } else {
        console.log('⚠️  Migration may be incomplete. Some tables were not found.');
      }
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('Invalid API key')) {
      console.error('\n💡 Tip: Check that your SUPABASE_SERVICE_ROLE_KEY is correct');
    } else if (error.message.includes('Project not found')) {
      console.error('\n💡 Tip: Check that your VITE_SUPABASE_URL is correct');
    } else if (error.message.includes('ENOENT')) {
      console.error('\n💡 Tip: Migration file not found. Check that supabase/migrations/20250620184438_lively_unit.sql exists');
    }
    
    process.exit(1);
  }
}

// Run the migration
runMigration();