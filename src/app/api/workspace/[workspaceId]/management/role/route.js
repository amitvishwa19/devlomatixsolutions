import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

// GET all roles with permissions and user counts
export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        
        const roles = await prisma.role.findMany({
            include: {
                _count: {
                    select: { users: true }
                },
                permissions: {
                    select: {
                        id: true,
                        title: true,
                        value: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(roles);
    } catch (error) {
        console.error("GET Roles Error:", error);
        return NextResponse.json({ message: "Failed to fetch roles" }, { status: 500 });
    }
}

// POST create a new role
export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const { title, description, color, permissionIds } = await req.json();

        if (!title) {
            return NextResponse.json({ message: "Title is required" }, { status: 400 });
        }

        const role = await prisma.role.create({
            data: {
                title,
                description,
                color: color || "#3b82f6",
                permissions: {
                    connect: permissionIds?.map(id => ({ id })) || []
                }
            },
            include: {
                permissions: true
            }
        });

        return NextResponse.json(role);
    } catch (error) {
        console.error("POST Role Error:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ message: "Role with this title already exists" }, { status: 400 });
        }
        return NextResponse.json({ message: "Failed to create role" }, { status: 500 });
    }
}
