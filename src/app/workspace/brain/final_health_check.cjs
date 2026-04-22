const { Pool } = require('pg');
require('dotenv').config();

async function verify() {
    const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
    try {
        const res = await pool.query(`
            SELECT c.name, c.status, COUNT(r.id) as recipient_count 
            FROM "Campaign" c 
            LEFT JOIN "CampaignRecipient" r ON c.id = r."campaignId" 
            GROUP BY c.id, c.name, c.status 
            ORDER BY c."updatedAt" DESC 
            LIMIT 1
        `);
        console.log("Health Check - Latest Campaign Stats:", JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
verify();
