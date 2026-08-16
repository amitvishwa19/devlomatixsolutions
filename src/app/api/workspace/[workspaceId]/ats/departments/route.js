import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { slugify } from "@/utils/functions";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // First find the root parent category for ATS Departments
        const rootParent = await prisma.category.findUnique({
            where: {
                workspaceId_slug: {
                    workspaceId,
                    slug: 'ats-departments'
                }
            }
        });

        if (!rootParent) {
            return NextResponse.json([]);
        }

        const departments = await prisma.category.findMany({
            where: { 
                workspaceId,
                parentId: rootParent.id
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(departments);
    } catch (error) {
        console.error("[ATS_DEPARTMENTS_GET]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json({ message: "Department name is required" }, { status: 400 });
        }

        // Find or ensure the root parent category exists for ATS Departments
        let rootParent = await prisma.category.findUnique({
            where: {
                workspaceId_slug: {
                    workspaceId,
                    slug: 'ats-departments'
                }
            }
        });

        // If it doesn't exist, we should probably create it or handle the error.
        // For robustness, I'll create it if it's missing (general root for departments).
        if (!rootParent) {
            rootParent = await prisma.category.create({
                data: {
                    name: 'ATS Departments',
                    slug: 'ats-departments',
                    workspaceId,
                    type: 'SYSTEM'
                }
            });
        }

        const slug = slugify(name);

        const department = await prisma.category.create({
            data: {
                name,
                slug,
                description,
                type: 'ATS_DEPARTMENT',
                parentId: rootParent.id,
                workspaceId
            }
        });

        return NextResponse.json(department);
    } catch (error) {
        console.error("[ATS_DEPARTMENTS_POST]", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ message: "Department already exists" }, { status: 409 });
        }
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ message: "Department ID is required" }, { status: 400 });
        }

        // Unlink any jobs attached to this department category first
        await prisma.job.updateMany({
            where: { categoryId: id, workspaceId },
            data: { categoryId: null }
        });

        // Delete the category
        await prisma.category.delete({
            where: {
                id,
                workspaceId
            }
        });

        return NextResponse.json({ message: "Department deleted successfully" });
    } catch (error) {
        console.error("[ATS_DEPARTMENTS_DELETE]", error);
        return NextResponse.json({ message: "Failed to delete department" }, { status: 500 });
    }
}
