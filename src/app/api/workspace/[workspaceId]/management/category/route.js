import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { slugify } from "@/utils/functions";

// GET all categories for a workspace
export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        
        // Fetch all categories using Raw SQL to ensure we get parentId 
        // even if the Prisma client is stale and doesn't know about the field.
        const allCategories = await prisma.$queryRawUnsafe(
            `SELECT * FROM "Category" WHERE "workspaceId" = $1 ORDER BY "createdAt" ASC`,
            workspaceId
        );

        // Manually build the tree structure
        const categoryMap = {};
        allCategories.forEach(cat => {
            categoryMap[cat.id] = { ...cat, children: [] };
        });

        const rootCategories = [];
        allCategories.forEach(cat => {
            // Check for parentId (lowercase or quoted - raw SQL returns what's in DB)
            const pId = cat.parentId || cat.parentId; // PostgreSQL usually preserves case if quoted, but JS mapping might vary
            
            if (pId && categoryMap[pId]) {
                categoryMap[pId].children.push(categoryMap[cat.id]);
            } else {
                rootCategories.push(categoryMap[cat.id]);
            }
        });

        // Final sort of root categories by newest first
        rootCategories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
        const { name, description, color, type, parentId } = await req.json();

        if (!name) {
            return NextResponse.json({ message: "Name is required" }, { status: 400 });
        }

        const slug = slugify(name);

        try {
            // Try standard creation first
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
        } catch (prismaError) {
            // FALLBACK: If parentId is unknown to the stale client, use raw SQL
            if (prismaError.message.includes('parentId') || prismaError.message.includes('Unknown argument')) {
                console.warn("FALLBACK: Using raw SQL for category creation due to stale Prisma client");
                
                const id = `cat_${Math.random().toString(36).substring(2, 11)}`;
                const now = new Date();
                
                await prisma.$executeRaw`
                    INSERT INTO "Category" (id, name, slug, description, color, type, "parentId", "workspaceId", "createdAt", "updatedAt")
                    VALUES (${id}, ${name}, ${slug}, ${description || null}, ${color || "#3b82f6"}, ${type || "GENERAL"}, ${parentId || null}, ${workspaceId}, ${now}, ${now})
                `;
                
                return NextResponse.json({ 
                    id, name, slug, description, color, type, parentId, workspaceId, 
                    createdAt: now, updatedAt: now 
                });
            }
            throw prismaError;
        }
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
// v4 - raw SQL GET and POST
