import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/v5/cron/stats
 * Aggregate metrics of cron requests from CronLog table
 */
export async function GET() {
    try {
        const [totalCount, successCount, failedCount, recentLogs] = await Promise.all([
            db.cronLog.count(),
            db.cronLog.count({ where: { status: 'SUCCESS' } }),
            db.cronLog.count({ where: { status: { in: ['FAILED', 'UNAUTHORIZED', 'ERROR'] } } }),
            db.cronLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    jobName: true,
                    source: true,
                    endpoint: true,
                    status: true,
                    statusCode: true,
                    durationMs: true,
                    createdAt: true
                }
            })
        ]);

        return NextResponse.json({
            success: true,
            stats: {
                totalExecutions: totalCount,
                successfulExecutions: successCount,
                failedExecutions: failedCount,
                successRatePercent: totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 100,
                recentExecutions: recentLogs
            }
        });
    } catch (error) {
        console.error('[API_V5_CRON_STATS_ERROR]', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
