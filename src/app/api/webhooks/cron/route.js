import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runWorkflow } from "@/lib/workflow-engine";
import parser from "cron-parser";
import serverLogger from "@/utils/serverLogger";

// Helper for v5.5.0 ESM compatibility
const getCron = () => {
    const p = parser.default || parser;
    // v5.5.0 uses p.parse, previous versions use p.parseExpression
    const parseFn = p.parse || p.parseExpression;
    return { parseExpression: parseFn.bind(p) };
};
const cronHelper = getCron();

export async function GET(req) {
    // Optional Security: Check Authorization Header if CRON_SECRET is defined
    const secret = process.env.CRON_SECRET;
    if (secret) {
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${secret}`) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
    }

    try {
        const now = new Date();

        // Find all active cron jobs where nextRunAt is past due (or missing and needs initialization)
        const dueCrons = await db.systemCron.findMany({
            where: {
                status: 'ACTIVE',
                OR: [
                    { nextRunAt: { lte: now } },
                    { nextRunAt: null }
                ]
            }
        });

        const executionResults = [];

        for (const cron of dueCrons) {
            try {
                // Determine next run time
                const interval = cronHelper.parseExpression(cron.cronExpression);
                const nextRunAt = interval.next().toDate();

                // If the target is a FLOWBOT, execute it
                if (cron.targetType === "FLOWBOT" && cron.targetId) {
                    const workflow = await db.workflow.findUnique({
                        where: { id: cron.targetId }
                    });

                    if (workflow) {
                        const workflowNodes = workflow.nodes || [];
                        let triggerNode = workflowNodes.find(n => n.type === 'triggerNode' || n.data?.subType === 'webhook' || n.data?.subType === 'cron' || n.data?.subType === 'manual');

                        if (triggerNode) {
                            // Create execution record
                            const execution = await db.workflowExecution.create({
                                data: {
                                    workflowId: workflow.id,
                                    status: "RUNNING",
                                    nodes: workflow.nodes,
                                    edges: workflow.edges,
                                    logs: [{ timestamp: new Date().toISOString(), message: `Triggered by System Cron: ${cron.name}` }]
                                }
                            });

                            // Execute asynchronously
                            runWorkflow(workflow.id, execution.id, triggerNode.id, cron.payload || { source: "system-cron" }).catch(err => {
                                console.error(`[CRON_FLOWBOT_ERROR] Job ID: ${cron.id}`, err);
                            });

                            executionResults.push({ cronId: cron.id, status: "Triggered Flowbot", executionId: execution.id });
                        }
                    }
                } else if (cron.targetType === "SYSTEM") {
                    // Decoupled / Manual integration placeholder
                    console.log(`[CRON_SYSTEM_TRIGGER] Job: ${cron.name}, Target: ${cron.targetId}`);

                    // Log to system logs
                    await db.systemLog.create({
                        data: {
                            level: "INFO",
                            type: "CRON",
                            message: `Scheduled Job Triggered: ${cron.name}`,
                            workspaceId: cron.workspaceId,
                            details: { targetId: cron.targetId, source: "system-cron-webhook" }
                        }
                    });

                    executionResults.push({ cronId: cron.id, status: "System Trigger Logged", targetId: cron.targetId });
                }

                // Update the cron's last and next run times
                await db.systemCron.update({
                    where: { id: cron.id },
                    data: {
                        lastRunAt: now,
                        nextRunAt: nextRunAt
                    }
                });

            } catch (jobError) {
                console.error(`[CRON_JOB_ERROR] Job ID: ${cron.id}`, jobError);
                await db.systemCron.update({
                    where: { id: cron.id },
                    data: { status: 'ERROR' }
                });
                executionResults.push({ cronId: cron.id, status: "ERROR", error: jobError.message });
            }
        }

        return NextResponse.json({ success: true, processed: dueCrons.length, results: executionResults });

    } catch (error) {
        console.error("[WEBHOOK_CRON_ERROR]", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    // Log the external trigger event via serverLogger
    await serverLogger.fromRequest(req, "External Cron POST Request Received", {
        type: "SYSTEM_WEBHOOK",
        details: { source: "external-cron-trigger" }
    });

    // Reroute external POST webhook triggers directly into the main execution pipeline
    return GET(req);
}
