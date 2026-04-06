const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase');
    
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n=== Tables in database ===');
    res.rows.forEach(row => console.log('  -', row.table_name));
    
    // Check users table
    const users = await client.query('SELECT COUNT(*) as count FROM users;');
    console.log('\n=== Users count:', users.rows[0].count);
    
    const apps = await client.query('SELECT COUNT(*) as count FROM applications;');
    console.log('=== Applications count:', apps.rows[0].count);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

main();
