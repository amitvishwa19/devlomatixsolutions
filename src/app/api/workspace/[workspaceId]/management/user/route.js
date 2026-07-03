import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import bcryptjs from "bcryptjs";

// GET all users with roles
export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const users = await prisma.user.findMany({
            select: {
                id: true,
                displayName: true,
                username: true,
                email: true,
                avatar: true,
                isActive: true,
                role: true,
                roles: {
                    select: {
                        id: true,
                        title: true,
                        color: true
                    }
                },
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("GET Management Users Error:", error);
        return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
    }
}

// PATCH update user roles
export async function PATCH(req, { params }) {
    try {
        const { workspaceId } = await params;
        const { userId, roleIds, isActive, displayName } = await req.json();

        if (!userId) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        const updateData = {};
        if (isActive !== undefined) updateData.isActive = isActive;
        if (displayName !== undefined) updateData.displayName = displayName;
        if (roleIds !== undefined) {
            updateData.roles = {
                set: [], // Clear
                connect: roleIds.map(id => ({ id }))
            };
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                roles: true,
                isActive: true
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("PATCH Management User Error:", error);
        return NextResponse.json({ message: "Failed to update user access" }, { status: 500 });
    }
}

// POST create new user manually
export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const { email, password, displayName, roleIds } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ message: "User with this email already exists" }, { status: 400 });
        }

        // Hash the password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Name fallback
        const name = displayName || email.split('@')[0];

        // Create the user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                displayName: name,
                isActive: true, // Manual creation defaults to active
                roles: roleIds ? {
                    connect: roleIds.map(id => ({ id }))
                } : undefined
            },
            select: {
                id: true,
                email: true,
                displayName: true,
                isActive: true,
                roles: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("POST Management User Error:", error);
        return NextResponse.json({ message: "Failed to create user" }, { status: 500 });
    }
}
