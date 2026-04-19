import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

/**
 * DATABASE TABLE LISTER
 * Lists all user-defined tables in the PostgreSQL database.
 */

// 1. Manual .env Loader (Consistency with other project scripts)
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').filter(line => line.trim() && !line.startsWith('#')).forEach(line => {
            const [key, ...valParts] = line.split('=');
            process.env[key.trim()] = valParts.join('=').trim().replace(/^["']|["']$/g, '');
        });
    }
} catch (e) { }

// 2. Identify Connection String
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
    console.error("\x1b[31mError: DIRECT_URL or DATABASE_URL not found in .env\x1b[0m");
    process.exit(1);
}

// 3. Execution Logic
async function listAllTables() {
    console.log("\x1b[34mConnecting to database and fetching tables...\x1b[0m\n");
    
    const pool = new Pool({ connectionString });
    
    try {
        const query = `
            SELECT tablename 
            FROM pg_catalog.pg_tables 
            WHERE schemaname != 'pg_catalog' 
            AND schemaname != 'information_schema'
            ORDER BY tablename ASC;
        `;
        
        const res = await pool.query(query);
        
        if (res.rows.length === 0) {
            console.log("\x1b[33mNo user-defined tables found.\x1b[0m");
        } else {
            console.log("\x1b[32m--- Database Tables ---\x1b[0m");
            res.rows.forEach((row, index) => {
                console.log(`[${String(index + 1).padStart(2, '0')}] ${row.tablename}`);
            });
            console.log(`\n\x1b[36mTotal Tables Found: ${res.rowCount}\x1b[0m`);
        }
        
    } catch (err) {
        console.error("\x1b[31mQuery Error:\x1b[0m", err.message);
    } finally {
        await pool.end();
    }
}

listAllTables();
