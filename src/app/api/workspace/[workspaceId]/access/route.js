import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;

        const users = await db.user.findMany({
            include: {
                roles: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const roles = await db.role.findMany({
            include: {
                permissions: true,
                users: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const departments = []; // Department model missing in schema.prisma

        const permissions = await db.permission.findMany({
            include: {
                roles: {
                    include: {
                        users: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
        });

        return NextResponse.json({
            users,
            roles,
            permissions,
            departments
        });
    } catch (error) {
        console.error("GET Access Data Error:", error);
        return NextResponse.json({ message: "Failed to fetch access data" }, { status: 500 });
    }
}
