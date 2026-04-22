const { Pool } = require('pg');
require('dotenv').config();

async function check() {
    const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
    try {
        const res = await pool.query(`SELECT id, phone, name, \"workspaceId\" FROM \"Contact\" LIMIT 10`);
        console.log("Contacts:", JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
check();
