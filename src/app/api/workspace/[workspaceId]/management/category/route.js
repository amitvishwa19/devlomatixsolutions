import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { slugify } from "@/utils/functions";

// GET all categories for a workspace with hierarchical nesting
export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        
        // Fetch only root categories and include their children (and children's children)
        // This leverages Prisma's native relationship mapping instead of Raw SQL.
        const rootCategories = await prisma.category.findMany({
            where: { 
                workspaceId,
                parentId: null 
            },
            include: {
                children: {
                    include: {
                        children: true // Support for sub-sub-categories
                    },
                    orderBy: {
                        name: 'asc'
                    }
                }
            },
            orderBy: { 
                createdAt: 'desc' 
            }
        });

        return NextResponse.json(rootCategories);
    } catch (error) {
        console.error("GET Categories Error:", error.message);
        return NextResponse.json({ 
            message: "Failed to fetch categories", 
            error: error.message 
        }, { status: 500 });
    }
}

// POST create a new category
export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const body = await req.json();
        const { name, slug: customSlug, description, color, type, parentId } = body;

        if (!name) {
            return NextResponse.json({ message: "Name is required" }, { status: 400 });
        }

        const slug = customSlug || slugify(name);

        // Standard creation using natively supported parentId
        const category = await prisma.category.create({
            data: {
                name,
                slug,
                description,
                color: color || "#3b82f6",
                type: type || "GENERAL",
                parentId: parentId || null,
                workspaceId
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("POST Category Error:", error.message);
        if (error.code === 'P2002') {
            return NextResponse.json({ message: "Category with this name or slug already exists" }, { status: 400 });
        }
        return NextResponse.json({ 
            message: "Failed to create category", 
            error: error.message 
        }, { status: 500 });
    }
}
