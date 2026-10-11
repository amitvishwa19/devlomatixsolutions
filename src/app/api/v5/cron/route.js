import { NextResponse } from 'next/server';
import { logCronRequest } from '@/lib/cron-logger';
import { db } from '@/lib/db';

/**
 * Common Cron Handler for /api/v5/cron
 * Supports GET, POST, PUT, DELETE, and HEAD
 */
async function handleCronRequest(req) {
    const startTime = Date.now();
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const jobName = searchParams.get('job') || searchParams.get('name') || 'Devlomatix v5 Cron Heartbeat';
    const source = searchParams.get('source') || null;
    const workspaceId = searchParams.get('workspaceId') || null;
    const cronId = searchParams.get('cronId') || null;

    let payload = null;
    if (req.method === 'POST' || req.method === 'PUT') {
        try {
            payload = await req.json();
        } catch {
            payload = null;
        }
    }

    try {
        // Optional Auth check if CRON_SECRET is configured
        const secret = process.env.CRON_SECRET;
        if (secret) {
            const authHeader = req.headers.get('authorization')?.replace('Bearer ', '');
            const urlSecret = searchParams.get('secret') || searchParams.get('token');

            if (authHeader !== secret && urlSecret !== secret) {
                const errorResponse = {
                    success: false,
                    message: 'Unauthorized cron access: Secret key mismatch',
                    timestamp: new Date().toISOString()
                };

                const log = await logCronRequest(req, {
                    jobName,
                    source: source || 'UNAUTHORIZED',
                    workspaceId,
                    cronId,
                    status: 'UNAUTHORIZED',
                    statusCode: 401,
                    response: errorResponse,
                    payload,
                    durationMs: Date.now() - startTime
                });

                return NextResponse.json(
                    { ...errorResponse, logId: log?.id || null },
                    { status: 401 }
                );
            }
        }

        // Perform any scheduled tasks or health checks if needed
        const responseData = {
            success: true,
            jobName,
            status: 'SUCCESS',
            message: 'Cron request processed and logged to CronLog table',
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV || 'production',
            version: 'v5'
        };

        const durationMs = Date.now() - startTime;

        // Automatically log into CronLog table
        const log = await logCronRequest(req, {
            jobName,
            source,
            workspaceId,
            cronId,
            status: 'SUCCESS',
            statusCode: 200,
            response: responseData,
            payload,
            durationMs
        });

        return NextResponse.json({
            ...responseData,
            logId: log?.id || null,
            durationMs
        });

    } catch (error) {
        console.error('[API_V5_CRON_ERROR]', error);

        const durationMs = Date.now() - startTime;
        const errorData = {
            success: false,
            jobName,
            status: 'FAILED',
            error: error.message,
            timestamp: new Date().toISOString()
        };

        const log = await logCronRequest(req, {
            jobName,
            source,
            workspaceId,
            cronId,
            status: 'FAILED',
            statusCode: 500,
            errorMessage: error.message,
            response: errorData,
            payload,
            durationMs
        });

        return NextResponse.json(
            { ...errorData, logId: log?.id || null, durationMs },
            { status: 500 }
        );
    }
}

export async function GET(req) {
    return handleCronRequest(req);
}

export async function POST(req) {
    return handleCronRequest(req);
}

export async function PUT(req) {
    return handleCronRequest(req);
}

export async function DELETE(req) {
    return handleCronRequest(req);
}
