import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/v5/cron/history
 * Fetch paginated execution logs from the CronLog table
 * Query options: limit, page, status, jobName, source, workspaceId
 */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
        const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
        const skip = (page - 1) * limit;

        const status = searchParams.get('status');
        const jobName = searchParams.get('jobName');
        const source = searchParams.get('source');
        const workspaceId = searchParams.get('workspaceId');
        const scope = searchParams.get('scope'); // 'all' | 'workspace'

        const where = {};
        if (status && status !== 'ALL') where.status = status;
        if (jobName && jobName.trim() !== '') where.jobName = { contains: jobName.trim(), mode: 'insensitive' };
        if (source && source !== 'ALL') where.source = source;
        if (scope === 'workspace' && workspaceId) {
            where.workspaceId = workspaceId;
        } else if (workspaceId && scope !== 'all') {
            where.OR = [
                { workspaceId: workspaceId },
                { workspaceId: null }
            ];
        }

        const [logs, total] = await Promise.all([
            db.cronLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            db.cronLog.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            data: logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('[API_V5_CRON_HISTORY_ERROR]', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/v5/cron/history
 * Purge logs or delete specific log
 */
export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const clearAll = searchParams.get('clearAll') === 'true';

        if (id) {
            await db.cronLog.delete({ where: { id } });
            return NextResponse.json({ success: true, message: 'Log entry deleted' });
        }

        if (clearAll) {
            const res = await db.cronLog.deleteMany({});
            return NextResponse.json({ success: true, count: res.count, message: 'All logs cleared' });
        }

        return NextResponse.json({ success: false, message: 'Provide id or clearAll=true' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
