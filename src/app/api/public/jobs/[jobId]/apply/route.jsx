import { NextResponse } from 'next/server';
import { applyForJob } from '@/app/(public)/career/_actions/apply-job';

export async function POST(req, { params }) {
    try {
        const { jobId } = await params;
        const body = await req.json();
        const { name, email, phone, resumeUrl, portfolioUrl } = body;

        const result = await applyForJob({
            jobId,
            name,
            email,
            phone,
            resumeUrl,
            portfolioUrl
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: result.message,
            application: result.application
        });

    } catch (error) {
        console.error("[JOB_APPLY_API_ERROR]", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
