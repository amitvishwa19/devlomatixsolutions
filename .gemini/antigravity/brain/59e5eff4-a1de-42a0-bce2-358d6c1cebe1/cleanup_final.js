import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres.cpjjmcqftkgnmrghgsfq:Amitvishwa%401981@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to database.');

  try {
    // 1. Check what's there
    const res = await client.query('SELECT id, name, "isDefault", "userId" FROM "MessageTemplate"');
    console.log(`Current Total Templates: ${res.rows.length}`);
    
    // 2. Delete all where isDefault is true
    const deleteRes = await client.query('DELETE FROM "MessageTemplate" WHERE "isDefault" = true');
    console.log(`Deleted ${deleteRes.rowCount} templates with isDefault = true.`);

    // 3. Optional: Delete everything for the specific user if still not clean
    // const deleteUserRes = await client.query('DELETE FROM "MessageTemplate" WHERE "userId" = \'cmnbhifag000458ikwhv1zso2\'');
    // console.log(`Deleted ${deleteUserRes.rowCount} templates for user cmnbhifag000458ikwhv1zso2.`);

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
}

main();
