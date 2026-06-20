import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:Didireloaded@1@db.fafpyshhhdqgvhhfycfc.supabase.co:5432/postgres',
});

async function run() {
  try {
    await client.connect();
    
    console.log("=== TABLES ===");
    const tablesRes = await client.query(`
      select table_name, column_name, data_type
      from information_schema.columns
      where table_schema = 'public'
      order by table_name, ordinal_position;
    `);
    console.log(JSON.stringify(tablesRes.rows, null, 2));

    console.log("=== FUNCTIONS ===");
    const funcRes = await client.query(`
      select routine_name, data_type
      from information_schema.routines
      where routine_schema = 'public' and routine_type = 'FUNCTION';
    `);
    console.log(JSON.stringify(funcRes.rows, null, 2));
    
  } catch (err) {
    console.error("Connection error", err.stack);
  } finally {
    await client.end();
  }
}

run();
