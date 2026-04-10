import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

// GET all permissions grouped by category
export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const permissions = await prisma.permission.findMany({
            orderBy: [
                { category: 'asc' },
                { title: 'asc' }
            ]
        });

        // Grouping logic (optional, can be done on frontend)
        const grouped = permissions.reduce((acc, p) => {
            const cat = p.category || "General";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(p);
            return acc;
        }, {});

        return NextResponse.json({
            all: permissions,
            grouped
        });
    } catch (error) {
        console.error("GET Permissions Error:", error);
        return NextResponse.json({ message: "Failed to fetch permissions" }, { status: 500 });
    }
}

// POST create a new system permission
export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const { title, value, description, category, color } = await req.json();

        if (!title || !value) {
            return NextResponse.json({ message: "Title and Value are required" }, { status: 400 });
        }

        const permission = await prisma.permission.create({
            data: {
                title,
                value: value.toLowerCase().replace(/\s+/g, ':'),
                description: description || "",
                category: category || "General",
                color: color || "#6366f1"
            }
        });

        return NextResponse.json(permission);
    } catch (error) {
        console.error("POST Permission Error:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ message: "Permission value already exists" }, { status: 400 });
        }
        return NextResponse.json({ message: "Failed to create permission" }, { status: 500 });
    }
}
