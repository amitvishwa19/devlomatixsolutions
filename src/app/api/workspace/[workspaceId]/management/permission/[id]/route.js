import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

// PATCH update permission
export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        const { title, value, description, category, color } = await req.json();

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (value !== undefined) updateData.value = value.toLowerCase().replace(/\s+/g, ':');
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (color !== undefined) updateData.color = color;

        const permission = await prisma.permission.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(permission);
    } catch (error) {
        console.error("PATCH Permission Error:", error);
        return NextResponse.json({ message: "Failed to update permission" }, { status: 500 });
    }
}

// DELETE permission
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;

        await prisma.permission.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Permission deleted successfully" });
    } catch (error) {
        console.error("DELETE Permission Error:", error);
        return NextResponse.json({ message: "Failed to delete permission" }, { status: 500 });
    }
}
