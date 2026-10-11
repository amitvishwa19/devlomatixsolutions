import { NextResponse } from 'next/server';
import { logCronRequest } from '@/lib/cron-logger';

async function handleNamedCronRequest(req, { params }) {
    const startTime = Date.now();
    const { jobName } = await params;
    const url = new URL(req.url);
    const searchParams = url.searchParams;

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
        const responseData = {
            success: true,
            jobName,
            status: 'SUCCESS',
            message: `Named cron job [${jobName}] executed and logged successfully`,
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV || 'production',
            version: 'v5'
        };

        const durationMs = Date.now() - startTime;

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
        console.error(`[API_V5_CRON_NAMED_ERROR] Job: ${jobName}`, error);

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

export async function GET(req, context) {
    return handleNamedCronRequest(req, context);
}

export async function POST(req, context) {
    return handleNamedCronRequest(req, context);
}

export async function PUT(req, context) {
    return handleNamedCronRequest(req, context);
}

export async function DELETE(req, context) {
    return handleNamedCronRequest(req, context);
}
