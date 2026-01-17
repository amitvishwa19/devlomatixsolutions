import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";

export default async function WorkspacePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.userId) {
        redirect("/login");
    }

    try {
        const server = await db.server.findFirst({
            where: {
                userId: session.user.userId,
                default: true,
            },
            select: {
                id: true,
            },
        });

        if (!server) {
            redirect("/unauthorized");
        }

        redirect(`/workspace/${server.id}`);
    } catch (error) {
        console.error("Workspace redirect error:", error);
        redirect("/unauthorized");
    }
}
