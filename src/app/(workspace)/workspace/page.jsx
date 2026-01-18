import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import WorkspaceLoader from "./_components/workspace/WorkspaceLoader";

export default async function WorkspacePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.userId) {
        redirect("/login");
    }

    let server;
    try {
        server = await db.server.findFirst({
            where: {
                userId: session.user.userId,
                default: true,
            },
            select: { id: true },
        });
    } catch (error) {
        console.error("DB error:", error);
        <WorkspaceLoader redirectTo="/unauthorized" />
    }

    if (!server) {
        <WorkspaceLoader redirectTo="/unauthorized" />
    } else {
        //redirect(`/workspace/${server.id}`);
    }




    return <WorkspaceLoader redirectTo={`/workspace/${server.id}`} />
}
