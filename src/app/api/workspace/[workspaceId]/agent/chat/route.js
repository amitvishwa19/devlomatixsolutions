import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { swarmCompletion } from "@/lib/swarm-engine";

/**
 * POST: Execute a command directed at a specific AI Agent persona
 */
export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        const { agentId, message, history } = await req.json();

        if (!session?.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (!agentId || !message) {
            return NextResponse.json({ message: "Agent ID and Message are required" }, { status: 400 });
        }

        // Orchestrate swarm completion with failover logic
        const result = await swarmCompletion({
            agentId,
            message,
            history,
            workspaceId
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("Swarm Chat Error:", error);
        return NextResponse.json({ 
            message: error.message || "Internal Swarm Failure" 
        }, { status: 500 });
    }
}
