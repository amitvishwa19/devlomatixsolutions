import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// GET workspace settings
export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const workspace = await prisma.server.findUnique({
            where: { id: workspaceId },
            include: {
                user: {
                    select: {
                        displayName: true,
                        email: true
                    }
                }
            }
        });

        if (!workspace) {
            return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
        }

        // Fetch advanced settings from AppSettings
        const appSettings = await prisma.appSettings.findUnique({
            where: { key: workspaceId }
        });

        // Merge with defaults
        const settings = {
            general: {
                name: workspace.name,
                description: workspace.description || "",
                imageUrl: workspace.imageUrl || "",
                inviteCode: workspace.inviteCode
            },
            branding: appSettings?.social || {
                primaryColor: "#3b82f6",
                logoUrl: workspace.imageUrl || "",
                appName: "",
                appDescription: "",
                workspaceUrl: `http://localhost:3000/workspace/${workspaceId}`
            },
            security: appSettings?.security || {
                mfaEnabled: false,
                sessionTimeout: 3600,
                passwordPolicy: "standard"
            },
            notifications: appSettings?.notifications || {
                whatsapp: true,
                email: true,
                push: false
            },
            integrations: appSettings?.integrations || {
                webhooks: [],
                apiKeys: []
            },
            developer: appSettings?.integrations || {
                webhooks: [],
                apiKeys: []
            },
            advanced: appSettings?.technical || {
                maintenanceMode: false,
                customCss: ""
            }
        };

        return NextResponse.json(settings);
    } catch (error) {
        console.error("GET Settings Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH update workspace settings
export async function PATCH(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        const body = await req.json();

        if (!session?.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Verify ownership or admin role (simplifying for now)
        const workspace = await prisma.server.findUnique({
            where: { id: workspaceId }
        });

        if (!workspace || workspace.userId !== session.user.userId) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { general, branding, security, notifications, integrations, developer, advanced } = body;

        // Sync developer with integrations if provided
        const finalIntegrations = developer || integrations;

        const serverUpdateData = {};
        if (general?.name) serverUpdateData.name = general.name;
        if (general?.description !== undefined) serverUpdateData.description = general.description;
        if (general?.imageUrl !== undefined) serverUpdateData.imageUrl = general.imageUrl;

        // Update Server model if needed
        if (Object.keys(serverUpdateData).length > 0) {
            await prisma.server.update({
                where: { id: workspaceId },
                data: serverUpdateData
            });
        }

        // Update or Create AppSettings
        await prisma.appSettings.upsert({
            where: { key: workspaceId },
            create: {
                key: workspaceId,
                social: branding || undefined,
                security: security || undefined,
                notifications: notifications || undefined,
                integrations: finalIntegrations || undefined,
                technical: advanced || undefined
            },
            update: {
                social: branding || undefined,
                security: security || undefined,
                notifications: notifications || undefined,
                integrations: finalIntegrations || undefined,
                technical: advanced || undefined
            }
        });

        return NextResponse.json({
            message: "Settings updated successfully"
        });
    } catch (error) {
        console.error("PATCH Settings Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
