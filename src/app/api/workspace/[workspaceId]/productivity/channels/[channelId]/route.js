import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { MemberRole } from "@prisma/client";

export async function DELETE(req, { params }) {
    try {
        const { workspaceId, channelId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify the user is an admin or creator in this workspace before allowing delete
        const currentMember = await db.member.findFirst({
            where: {
                serverId: workspaceId,
                userId: session.user.userId,
            }
        });

        if (!currentMember || (currentMember.role !== MemberRole.ADMIN && currentMember.role !== MemberRole.MODERATOR)) {
            // Depending on requirements, we could also allow the channel creator to delete. 
            // For now, only Admin/Moderator can delete.
            return new NextResponse("Missing permissions to delete channel", { status: 403 });
        }

        // Check if it's the default 'general' channel to prevent deleting it
        const channel = await db.channel.findFirst({
            where: {
                id: channelId,
                serverId: workspaceId,
            }
        });

        if (!channel) {
            return new NextResponse("Channel not found", { status: 404 });
        }

        if (channel.name === "general") {
            return new NextResponse("Cannot delete the general channel", { status: 400 });
        }

        // Delete the channel
        await db.channel.delete({
            where: {
                id: channelId,
            }
        });

        return NextResponse.json({ message: "Channel deleted successfully" });

    } catch (error) {
        console.error("[CHANNEL_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
