// app/(workspace)/workspace/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export default async function WorkspacePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.userId) {
        redirect("/login");
    }

    console.log('session', session)

    // Fetch default server/org
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

    // 🚀 Instant redirect (no client delay)
    redirect(`/workspace/${server.id}`);
}
