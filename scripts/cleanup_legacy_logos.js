import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';

// 1. Manual .env Loader 
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').filter(line => line.trim() && !line.startsWith('#') && line.includes('=')).forEach(line => {
            const [key, ...valParts] = line.split('=');
            process.env[key.trim()] = valParts.join('=').trim().replace(/^["']|["']$/g, '');
        });
    }
} catch (e) {}

const connectionString = process.env.APP_MODE === 'prod' ? process.env.DATABASE_URL : (process.env.DIRECT_URL || process.env.DATABASE_URL);
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function cleanup() {
    console.log("Starting Aggressive Legacy Logo Cleanup (Fixing 404s)...");
    try {
        const templates = await prisma.emailAssignment.findMany();
        let updatedCount = 0;

        for (const template of templates) {
            if (!template.content) continue;

            let newContent = template.content;
            let modified = false;

            // Pattern 1: Hardcoded /static/ paths for known logos
            const legacyPatterns = [
                /\/static\/devlomatix_dark\.png/g,
                /\/static\/aws-logo\.png/g,
                /\/static\/koala-logo\.png/g,
                /https?:\/\/localhost:3000\/static\/[a-zA-Z0-9_-]+\.png/g,
                /src=["']\/static\/[a-zA-Z0-9_-]+\.(png|jpg|jpeg|gif)["']/g,
                /href=["']\/static\/[a-zA-Z0-9_-]+\.(png|jpg|jpeg|gif)["']/g
            ];

            // Specifically handle the src="..." cases to replace precisely
            // We want to replace the VALUE inside src="/static/..."
            
            // Replacement for /static/*.png in src or href
            newContent = newContent.replace(/(src|href)=["']\/static\/[a-zA-Z0-9_-]+\.(?:png|jpg|jpeg|gif)["']/gi, (match, prefix) => {
                modified = true;
                return `${prefix}="{{appLogo}}"`;
            });

            // Catch-all for remaining devlomatix_dark strings
            if (newContent.includes('devlomatix_dark.png') || newContent.includes('aws-logo.png') || newContent.includes('koala-logo.png')) {
                newContent = newContent.replace(/devlomatix_dark\.png/g, '{{appLogo}}');
                newContent = newContent.replace(/aws-logo\.png/g, '{{appLogo}}');
                newContent = newContent.replace(/koala-logo\.png/g, '{{appLogo}}');
                
                // Update specific Alt texts too
                newContent = newContent.replace(/alt=["']AWS's Logo["']/gi, 'alt="{{appName}}"');
                newContent = newContent.replace(/alt=["']Koala["']/gi, 'alt="{{appName}}"');
                newContent = newContent.replace(/AWS Email Verification/gi, '{{appName}} Verification');
                
                modified = true;
            }

            if (modified) {
                await prisma.emailAssignment.update({
                    where: { id: template.id },
                    data: { content: newContent }
                });
                console.log(`+ Unified branding in "${template.templateName}"`);
                updatedCount++;
            }
        }

        console.log(`\n--- Done! Fixed ${updatedCount} templates. --- \n`);
    } catch (err) {
        console.error("Cleanup Error:", err);
    }
}

cleanup()
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
