import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { slugify } from "@/utils/functions";

// PATCH update a category
export async function PATCH(req, { params }) {
    try {
        const { workspaceId, categoryId } = await params;
        const { name, description, color, type, parentId } = await req.json();

        const updateData = {};
        if (name) {
            updateData.name = name;
            updateData.slug = slugify(name);
        }
        if (description !== undefined) updateData.description = description;
        if (color) updateData.color = color;
        if (type) updateData.type = type;
        if (parentId !== undefined) updateData.parentId = parentId;

        try {
            // Try standard update first
            const category = await prisma.category.update({
                where: {
                    id: categoryId,
                    workspaceId: workspaceId
                },
                data: updateData
            });
            return NextResponse.json(category);
        } catch (prismaError) {
            // FALLBACK: If client is stale, use raw SQL
            if (prismaError.message.includes('parentId') || prismaError.message.includes('Unknown argument')) {
                console.warn("FALLBACK: Using raw SQL for category update due to stale Prisma client");
                
                const setClauses = [];
                const values = [];
                let i = 1;

                if (name) {
                    setClauses.push(`name = $${i++}`, `slug = $${i++}`);
                    values.push(name, slugify(name));
                }
                if (description !== undefined) {
                    setClauses.push(`description = $${i++}`);
                    values.push(description);
                }
                if (color) {
                    setClauses.push(`color = $${i++}`);
                    values.push(color);
                }
                if (type) {
                    setClauses.push(`type = $${i++}`);
                    values.push(type);
                }
                if (parentId !== undefined) {
                    setClauses.push(`"parentId" = $${i++}`);
                    values.push(parentId);
                }

                setClauses.push(`"updatedAt" = $${i++}`);
                values.push(new Date());

                if (setClauses.length === 0) return NextResponse.json({ message: "No changes" });

                const query = `UPDATE "Category" SET ${setClauses.join(', ')} WHERE id = $${i++} AND "workspaceId" = $${i} RETURNING *`;
                values.push(categoryId, workspaceId);

                const result = await prisma.$queryRawUnsafe(query, ...values);
                return NextResponse.json(result[0]);
            }
            throw prismaError;
        }
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
