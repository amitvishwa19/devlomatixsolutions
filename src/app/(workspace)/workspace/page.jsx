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


    console.log(session);

    let server;
    let hospitals
    try {
        server = await db.server.findFirst({
            where: {
                userId: session.user.userId,
                default: true,
            },
            select: { id: true },
        });

        console.log(server);

        // hospitals = await db.hospital.findMany({
        //     where: {
        //         members: {
        //             some: { id: session.user.userId },
        //         }
        //     },
        // })



    } catch (error) {
        console.error("DB error:", error);
        <WorkspaceLoader redirectTo="/unauthorized" />
    }

    // if (hospitals.length !== 0) {
    //     return <WorkspaceLoader setup={true} />
    // }

    if (!server) {
        return <WorkspaceLoader redirectTo="/unauthorized" />
    }


    // redirectTo={`/workspace/${server.id}`} 

    return <WorkspaceLoader redirectTo={`/workspace/${server.id}`} />

}

