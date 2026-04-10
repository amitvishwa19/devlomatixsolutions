import { NextResponse } from 'next/server';



export async function GET(req) {
    try {
        // If token is valid, proceed with API logic
        const authToken = req.headers.get('authorization')?.replace('Bearer ', '');

        if (authToken !== process.env.CRON_SECRET) {
            return NextResponse.json(
                { error: 'Unauthorized access. Invalid token.' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            ok: true,
            message: "Vercel Cron endpoint is working",
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV,
            vercel: true,
            cron: true,
            status: 200
        });
    } catch (error) {
        console.error("[CRON_ERROR]", error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}


