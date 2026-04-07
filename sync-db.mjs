import "dotenv/config";
import { prisma } from './prisma.js';
import fs from 'fs';
import path from 'path';

async function fix() {
    const emailDir = path.join(process.cwd(), 'src', 'emails');
    const files = fs.readdirSync(emailDir).filter(f => f.endsWith('.jsx'));
    
    for (const filename of files) {
        let content = fs.readFileSync(path.join(emailDir, filename), 'utf8');
        // strictly ensure the default prop is there
        content = content.replace(/\{ mailData \}/g, '{ mailData = {} }');
        content = content.replace(/\{mailData\}/g, '{mailData = {}}');
        
        // Write it physically just in case it was reverted
        fs.writeFileSync(path.join(emailDir, filename), content);
        
        await prisma.emailAssignment.updateMany({
            where: { templateName: filename },
            data: { content: content }
        });
        console.log("Fixed DB & Disk for " + filename);
    }
    console.log("All DB records successfully updated!");
    process.exit(0);
}

fix();
