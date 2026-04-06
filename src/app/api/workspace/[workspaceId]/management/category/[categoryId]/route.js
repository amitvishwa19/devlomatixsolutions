import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { slugify } from "@/utils/functions";

// PATCH update a category
export async function PATCH(req, { params }) {
    try {
        const { workspaceId, categoryId } = await params;
        const body = await req.json();
        const { name, slug: customSlug, description, color, type, parentId } = body;
        
        const updateData = {};
        if (name) {
            updateData.name = name;
            updateData.slug = customSlug || slugify(name);
        } else if (customSlug) {
            updateData.slug = customSlug;
        }
        if (description !== undefined) updateData.description = description;
        if (color) updateData.color = color;
        if (type) updateData.type = type;
        if (parentId !== undefined) {
          updateData.parentId = parentId === "none" ? null : parentId;
        }

        // Standard update using natively supported parentId
        const category = await prisma.category.update({
            where: {
                id: categoryId,
                workspaceId: workspaceId
            },
            data: updateData
        });
        
        return NextResponse.json(category);
    } catch (error) {
        console.error("PATCH Category Error:", error.message);
        if (error.code === 'P2002') {
            return NextResponse.json({ message: "Category with this name or slug already exists" }, { status: 400 });
        }
        return NextResponse.json({ message: "Failed to update category", error: error.message }, { status: 500 });
    }
}

// DELETE a category
export async function DELETE(req, { params }) {
    try {
        const { workspaceId, categoryId } = await params;

        // Note: Cascade deletion is handled by Prisma schema for children
        await prisma.category.delete({
            where: {
                id: categoryId,
                workspaceId: workspaceId
            }
        });

        return NextResponse.json({ message: "Category deleted" });
    } catch (error) {
        console.error("DELETE Category Error:", error.message);
        return NextResponse.json({ message: "Failed to delete category", error: error.message }, { status: 500 });
    }
}
