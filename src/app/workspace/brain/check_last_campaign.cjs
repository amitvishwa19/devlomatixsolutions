const { Pool } = require('pg');
require('dotenv').config();

async function check() {
    const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
    try {
        const res = await pool.query(`SELECT id, name, status, description, "userId" FROM "Campaign" ORDER BY "updatedAt" DESC LIMIT 1`);
        console.log("Last Campaign:", JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
check();
