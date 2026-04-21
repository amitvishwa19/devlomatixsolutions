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

        // Orchestration Debugger: Log the incoming target and payload
        console.log(`[SwarmRequest] Target Agent: ${agentId} | History: ${history?.length || 0} messages`);
        
        // Orchestrate swarm completion with failover logic
        const result = await swarmCompletion({
            agentId,
            message,
            history,
            workspaceId
        });

        console.log(`[SwarmResponse] Completion successful via Node: ${result.node?.name}`);
        return NextResponse.json(result);

    } catch (error) {
        console.error("!!! Swarm Fatal Error !!!");
        console.error("- Message:", error.message);
        console.error("- Stack Trace:", error.stack?.substring(0, 200));
        return NextResponse.json({ 
            message: error.message || "Internal Swarm Failure" 
        }, { status: 500 });
    }
}
