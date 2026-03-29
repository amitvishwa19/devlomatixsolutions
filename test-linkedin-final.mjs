import pg from 'pg';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

function decrypt(storedData) {
    if (!storedData || !ENCRYPTION_KEY) return storedData;
    let data = typeof storedData === 'string' ? JSON.parse(storedData) : storedData;
    
    if (data.enc && typeof data.enc === 'string') {
        try {
            const parts = data.enc.split(':');
            const ivBuffer = Buffer.from(parts[0], 'hex');
            const encText = Buffer.from(parts.slice(1).join(':'), 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), ivBuffer);
            let decrypted = decipher.update(encText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return JSON.parse(decrypted.toString());
        } catch (e) {
            console.error("[DECRYPT_FAILED]", e.message);
        }
    }
    return data;
}

async function run() {
    const pool = new Pool({ connectionString });
    try {
        console.log("Fetching LinkedIn credentials via PG...");
        const res = await pool.query("SELECT credentials FROM \"Credentials\" WHERE platform = 'LINKEDIN' ORDER BY \"createdAt\" DESC LIMIT 1");
        
        if (res.rows.length === 0) {
            console.error("No LinkedIn credentials found.");
            return;
        }

        const details = decrypt(res.rows[0].credentials);
        const token = (details.accessToken || details.access_token || details.token || '').trim();
        const orgUrnOrId = (details.organizationUrn || details.organization_urn || '').trim();

        if (!token) {
            console.error("Missing token.");
            return;
        }

        const author = orgUrnOrId.startsWith('urn:li:') ? orgUrnOrId : `urn:li:organization:${orgUrnOrId}`;
        console.log(`Target Author: ${author}`);

        const headers = {
            'Authorization': `Bearer ${token}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'Accept': 'application/json'
        };

        // 1. Check ACL
        console.log("Checking organization ACLs...");
        const aclRes = await fetch(`https://api.linkedin.com/v2/organizationAcls?q=organization&organization=${encodeURIComponent(author)}&role=ADMINISTRATOR&state=APPROVED`, { headers });
        const aclData = await aclRes.json();
        console.log("ACL Response Status:", aclRes.status);

        if (aclRes.status !== 200 || !aclData?.elements?.length) {
            console.error("TOKEN STILL DOES NOT HAVE PERMISSION.");
            console.log("ACL Result Body:", JSON.stringify(aclData, null, 2));
            return;
        }

        console.log("Permission Verified! Attempting dummy post...");

        const postData = {
            author: author,
            commentary: `Test post from Devlomatix solutions at ${new Date().toLocaleString()} - SUCCESS!`,
            visibility: "PUBLIC",
            distribution: {
                feedDistribution: "MAIN_FEED",
                targetEntities: []
            },
            lifecycleState: "PUBLISHED",
            isReshareDisabledByAuthor: false
        };

        const response = await fetch('https://api.linkedin.com/v2/posts', {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
                'LinkedIn-Version': '202401'
            },
            body: JSON.stringify(postData)
        });

        console.log(`Status: ${response.status}`);
        const respText = await response.text();
        console.log(`Response: ${respText}`);

        if (response.status === 201) {
            console.log("SUCCESS! Check your page.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

run();
