const { Pool } = require('pg');
require('dotenv').config();

async function check() {
    const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
    try {
        const res = await pool.query(`SELECT id, phone, status, "campaignId" FROM "CampaignRecipient" ORDER BY "createdAt" DESC LIMIT 5`);
        console.log("Last Recipients:", JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
check();
