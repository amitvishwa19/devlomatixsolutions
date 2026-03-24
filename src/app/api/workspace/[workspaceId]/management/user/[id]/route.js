import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

// DELETE user from workspace management
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;

        // Perform hard delete (Prisma schema shows many cascades are set up)
        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({ message: "User removed successfully" });
    } catch (error) {
        console.error("DELETE User Error:", error);
        return NextResponse.json({ message: "Failed to remove user" }, { status: 500 });
    }
}
