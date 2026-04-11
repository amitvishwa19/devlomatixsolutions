import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req) {
    try {
        const body = await req.json();
        const { csvData, workspaceId, userId } = body;

        if (!csvData || !workspaceId || !userId) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Simple CSV Parser (handles basic quotes and commas)
        const lines = csvData.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
            return NextResponse.json({ error: 'CSV file is empty or has no data rows' }, { status: 400 });
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const dataRows = lines.slice(1);

        let successCount = 0;
        let errorCount = 0;
        const results = [];

        // Fetch existing categories for this workspace to avoid redundant DB calls in loop
        const existingCategories = await db.category.findMany({
            where: { workspaceId, type: 'CONTACT' }
        });

        for (const row of dataRows) {
            try {
                // Regex to split by comma but ignore commas inside quotes
                const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
                const cleanValues = values.map(v => v.replace(/^"|"$/g, '').trim());

                const record = {};
                headers.forEach((header, index) => {
                    record[header] = cleanValues[index] || '';
                });

                const name = record.name || 'Unnamed Contact';
                const phone = (record.phone || '').replace(/[^\d+]/g, ''); // Clean phone
                
                if (!phone) {
                    errorCount++;
                    continue;
                }

                const email = record.email || null;
                const categoryName = record.category || null;
                const tagsRaw = record.tags || '';
                const tags = tagsRaw ? tagsRaw.split('|').map(t => t.trim()).filter(Boolean) : [];

                let categoryId = null;
                if (categoryName) {
                    let cat = existingCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
                    if (!cat) {
                        // Create missing category
                        const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
                        cat = await db.category.create({
                            data: { name: categoryName, slug, workspaceId, type: 'CONTACT' }
                        });
                        existingCategories.push(cat);
                    }
                    categoryId = cat.id;
                }

                // Upsert Contact
                await db.contact.upsert({
                    where: {
                        workspaceId_phone: { workspaceId, phone }
                    },
                    update: {
                        name,
                        email,
                        categoryId,
                        tags: { set: tags }
                    },
                    create: {
                        name,
                        phone,
                        email,
                        userId,
                        workspaceId,
                        categoryId,
                        tags
                    }
                });

                successCount++;
            } catch (rowError) {
                console.error('Row Import Error:', rowError);
                errorCount++;
            }
        }

        return NextResponse.json({ 
            message: 'Import complete', 
            stats: { total: dataRows.length, success: successCount, errors: errorCount } 
        });

    } catch (error) {
        console.error('Import API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error during import' }, { status: 500 });
    }
}
