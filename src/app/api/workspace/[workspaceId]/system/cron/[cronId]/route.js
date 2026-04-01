import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import parser from "cron-parser";

export async function PUT(req, { params }) {
    try {
        const { workspaceId, cronId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { name, description, cronExpression, targetType, targetId, status } = await req.json();

        // Target updating nextRunAt if the expression or status changed
        const existing = await db.systemCron.findUnique({ where: { id: cronId, workspaceId } });
        if (!existing) {
            return NextResponse.json({ message: "Cron Job not found" }, { status: 404 });
        }

        let nextRunAt = existing.nextRunAt;
        if (cronExpression !== undefined && cronExpression !== existing.cronExpression) {
            try {
                const interval = parser.parseExpression(cronExpression);
                nextRunAt = interval.next().toDate();
            } catch (err) {
                return NextResponse.json({ message: "Invalid cron expression." }, { status: 400 });
            }
        }

        if (status === "ACTIVE" && existing.status !== "ACTIVE") {
            // Re-calculate the next run correctly when activating from idle
            try {
                const expr = cronExpression || existing.cronExpression;
                const interval = parser.parseExpression(expr);
                nextRunAt = interval.next().toDate();
            } catch (err) {
                return NextResponse.json({ message: "Invalid cron expression." }, { status: 400 });
            }
        } else if (status === "INACTIVE") {
            nextRunAt = null;
        }

        const updatedJob = await db.systemCron.update({
            where: { id: cronId },
            data: {
                name: name !== undefined ? name : undefined,
                description: description !== undefined ? description : undefined,
                cronExpression: cronExpression !== undefined ? cronExpression : undefined,
                status: status !== undefined ? status : undefined,
                targetType: targetType !== undefined ? targetType : undefined,
                targetId: targetId !== undefined ? targetId : undefined,
                nextRunAt: nextRunAt
            }
        });

        return NextResponse.json({ success: true, data: updatedJob });
    } catch (error) {
        console.error("[CRON_PUT]", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { workspaceId, cronId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await db.systemCron.delete({
            where: { id: cronId, workspaceId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[CRON_DELETE]", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
