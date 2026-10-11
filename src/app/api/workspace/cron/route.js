import { NextResponse } from 'next/server';
import { logCronRequest } from '@/lib/cron-logger';

export async function GET(req) {
    const startTime = Date.now();
    try {
        const authToken = req.headers.get('authorization')?.replace('Bearer ', '');

        if (process.env.CRON_SECRET && authToken !== process.env.CRON_SECRET) {
            await logCronRequest(req, {
                jobName: 'Vercel System Keepalive',
                source: 'VERCEL',
                status: 'UNAUTHORIZED',
                statusCode: 401,
                errorMessage: 'Invalid authorization token',
                durationMs: Date.now() - startTime
            });

            return NextResponse.json(
                { error: 'Unauthorized access. Invalid token.' },
                { status: 401 }
            );
        }

        const resData = {
            ok: true,
            message: "Cron endpoint is working and logged",
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV,
            cron: true,
            status: 200
        };

        await logCronRequest(req, {
            jobName: 'Vercel System Keepalive',
            source: 'VERCEL',
            status: 'SUCCESS',
            statusCode: 200,
            response: resData,
            durationMs: Date.now() - startTime
        });

        return NextResponse.json(resData);
    } catch (error) {
        console.error("[CRON_ERROR]", error);

        await logCronRequest(req, {
            jobName: 'Vercel System Keepalive',
            status: 'FAILED',
            statusCode: 500,
            errorMessage: error.message,
            durationMs: Date.now() - startTime
        });

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
