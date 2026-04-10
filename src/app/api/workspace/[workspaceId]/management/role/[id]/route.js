import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

// PATCH update role or permissions
export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        const { title, description, color, status, permissionIds } = await req.json();

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (color !== undefined) updateData.color = color;
        if (status !== undefined) updateData.status = status;

        if (permissionIds !== undefined) {
            updateData.permissions = {
                set: [], // Clear existing relations
                connect: permissionIds.map(id => ({ id }))
            };
        }

        const role = await prisma.role.update({
            where: { id },
            data: updateData,
            include: {
                permissions: true
            }
        });

        return NextResponse.json(role);
    } catch (error) {
        console.error("PATCH Role Error:", error);
        return NextResponse.json({ message: "Failed to update role" }, { status: 500 });
    }
}

// DELETE role
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;

        await prisma.role.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Role deleted successfully" });
    } catch (error) {
        console.error("DELETE Role Error:", error);
        return NextResponse.json({ message: "Failed to delete role" }, { status: 500 });
    }
}
