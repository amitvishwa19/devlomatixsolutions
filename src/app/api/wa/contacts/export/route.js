import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get('workspaceId');

        if (!workspaceId) {
            return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
        }

        const contacts = await db.contact.findMany({
            where: { workspaceId },
            include: { 
                category: true 
            },
            orderBy: { createdAt: 'desc' }
        });

        // Generate CSV content
        const headers = ['Name', 'Phone', 'Email', 'Category', 'Tags'];
        const rows = contacts.map(c => [
            `"${c.name.replace(/"/g, '""')}"`,
            `"${c.phone}"`,
            `"${(c.email || '').replace(/"/g, '""')}"`,
            `"${(c.category?.name || '').replace(/"/g, '""')}"`,
            `"${(c.tags || []).join('|')}"`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="contacts-${workspaceId}.csv"`,
            },
        });
    } catch (error) {
        console.error('Export Error:', error);
        return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 });
    }
}
