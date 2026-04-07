import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';

// 1. Manual .env Loader (since dotenv is not in package.json)
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
                const [key, ...valParts] = trimmedLine.split('=');
                const value = valParts.join('=').trim().replace(/^["']|["']$/g, '');
                process.env[key.trim()] = value;
            }
        });
        console.log("Loaded environment variables from .env");
    }
} catch (envError) {
    console.warn("Warning: Could not load .env file manually:", envError.message);
}

// 2. Initialize Prisma with PG Adapter (matching lib/db.js)
const connectionString = process.env.APP_MODE === 'prod' ? process.env.DATABASE_URL : (process.env.DIRECT_URL || process.env.DATABASE_URL);
if (!connectionString) {
    console.error("Error: DATABASE_URL or DIRECT_URL not found in environment.");
    process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const brandingHeader = `
<div class="app-branding-header" style="text-align: center; padding: 20px 0; border-bottom: 1px solid #f0f0f0; margin-bottom: 30px;">
  {{#if appLogo}}
    <img src="{{appLogo}}" alt="{{appName}}" style="max-height: 50px; width: auto; display: inline-block; vertical-align: middle;">
  {{else}}
    <h1 style="color: #3b82f6; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 700;">{{appName}}</h1>
  {{/if}}
</div>
`;

async function migrate() {
    console.log("Starting branding migration...");
    try {
        const templates = await prisma.emailAssignment.findMany();
        console.log(`Found ${templates.length} templates to check.`);
        
        let updatedCount = 0;
        let skippedCount = 0;

        for (const template of templates) {
            if (!template.content) continue;

            const content = template.content;
            if (content.includes('app-branding-header') || content.includes('appLogo') || content.includes('appName')) {
                console.log(`- Skipping "${template.templateName}" (already contains branding tags)`);
                skippedCount++;
                continue;
            }

            let newContent = content;
            
            // Strategy: Inject after the first <body> tag if it exists, otherwise after the first <div> wrapper, 
            // or just prepend if neither is found in a clear way.
            const bodyTag = newContent.toLowerCase().indexOf('<body');
            const divTag = newContent.toLowerCase().indexOf('<div');
            
            const targetIndex = bodyTag !== -1 ? bodyTag : divTag;

            if (targetIndex !== -1) {
                const tagEnd = newContent.indexOf('>', targetIndex);
                if (tagEnd !== -1) {
                    newContent = newContent.slice(0, tagEnd + 1) + "\n" + brandingHeader + "\n" + newContent.slice(tagEnd + 1);
                } else {
                    newContent = brandingHeader + "\n" + newContent;
                }
            } else {
                newContent = brandingHeader + "\n" + newContent;
            }

            await prisma.emailAssignment.update({
                where: { id: template.id },
                data: { content: newContent }
            });
            
            console.log(`+ Updated "${template.templateName}"`);
            updatedCount++;
        }

        console.log("\n--- Migration Summary ---");
        console.log(`Successfully updated: ${updatedCount}`);
        console.log(`Skipped (already processed): ${skippedCount}`);
        console.log("-------------------------\n");
    } catch (dbError) {
        console.error("Database Error during migration:", dbError);
    }
}

migrate()
    .catch(err => {
        console.error("Migration Unhandled Error:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
