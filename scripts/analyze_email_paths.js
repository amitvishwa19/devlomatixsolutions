import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';

// Manual .env Loader 
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

const connectionString = process.env.APP_MODE === 'prod' ? process.env.DATABASE_URL : (process.env.DIRECT_URL || process.env.DATABASE_URL);
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function analyze() {
    console.log("Searching for problematic static paths in EmailAssignment table...");
    try {
        const templates = await prisma.emailAssignment.findMany();
        let found = false;

        for (const template of templates) {
            if (template.content && (template.content.includes('/static/') || template.content.includes('devlomatix_dark.png'))) {
                console.log(`\n--- Template: ${template.templateName} ---`);

                // Find the line containing the match
                const lines = template.content.split('\n');
                lines.forEach((line, i) => {
                    if (line.includes('/static/') || line.includes('devlomatix_dark.png')) {
                        console.log(`Line ${i + 1}: ${line.trim()}`);
                    }
                });
                found = true;
            }
        }

        if (!found) {
            console.log("No templates found in database containing '/static/' or 'devlomatix_dark.png'.");
        }
    } catch (err) {
        console.error("Analysis Error:", err);
    }
}

analyze()
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
