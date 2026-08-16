import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// GET workspace settings
export async function GET(req, { params }) {
    try {
        const resolvedParams = await params;
        const workspaceId = resolvedParams?.workspaceId;

        if (!workspaceId) {
            return NextResponse.json({ message: "Workspace ID is required" }, { status: 400 });
        }

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

        // 1. Fetch workspace-specific settings (Security, Notifications, etc.)
        const workspaceSettings = await prisma.appSettings.findUnique({
            where: { key: workspaceId }
        });

        // 2. Fetch global app settings (Identity, Branding, Logo)
        const globalSettings = await prisma.appSettings.findUnique({
            where: { key: 'APP_GENERAL' }
        });

        // Safely resolve JSON fields as objects
        const workspaceGeneral = (typeof workspaceSettings?.general === 'object' && workspaceSettings?.general) ? workspaceSettings.general : {};
        const workspaceSecurity = (typeof workspaceSettings?.security === 'object' && workspaceSettings?.security) ? workspaceSettings.security : {};
        const workspaceNotifications = (typeof workspaceSettings?.notifications === 'object' && workspaceSettings?.notifications) ? workspaceSettings.notifications : {};
        const workspaceIntegrations = (typeof workspaceSettings?.integrations === 'object' && workspaceSettings?.integrations) ? workspaceSettings.integrations : {};
        const workspaceTechnical = (typeof workspaceSettings?.technical === 'object' && workspaceSettings?.technical) ? workspaceSettings.technical : {};
        const workspacePrivacy = (typeof workspaceSettings?.privacy === 'object' && workspaceSettings?.privacy) ? workspaceSettings.privacy : {};

        const globalSocial = (typeof globalSettings?.social === 'object' && globalSettings?.social) ? globalSettings.social : {};

        // Merge with defaults
        const defaultBranding = {
            primaryColor: "#3b82f6",
            logoUrl: workspace.imageUrl || "",
            appName: "Devlomatix",
            appDescription: "Your Productivity Platform",
            workspaceUrl: `http://localhost:3000`
        };

        const settings = {
            general: {
                name: workspace.name,
                description: workspace.description || "",
                imageUrl: workspace.imageUrl || "",
                inviteCode: workspace.inviteCode,
                socialLinks: workspaceGeneral.socialLinks || {},
                ...workspaceGeneral
            },
            branding: {
                ...defaultBranding,
                ...globalSocial,
                socialLinks: workspaceGeneral.socialLinks || globalSocial.socialLinks || {}
            },
            security: {
                mfaEnabled: false,
                sessionTimeout: 3600,
                passwordPolicy: "standard",
                ...workspaceSecurity
            },
            notifications: {
                whatsapp: true,
                email: true,
                push: false,
                ...workspaceNotifications
            },
            integrations: {
                webhooks: [],
                apiKeys: [],
                ...workspaceIntegrations
            },
            developer: {
                webhooks: [],
                apiKeys: [],
                ...workspaceIntegrations
            },
            advanced: {
                maintenanceMode: false,
                customCss: "",
                ...workspaceTechnical
            },
            privacy: {
                dataRetention: 365,
                gdprCompliant: true,
                activityLogging: true,
                visitorLoggingEnabled: true,
                ...workspacePrivacy
            }
        };

        return NextResponse.json(settings);
    } catch (error) {
        console.error("GET Settings Error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error?.message || String(error) }, { status: 500 });
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

        const { general, branding, security, notifications, integrations, developer, advanced, privacy } = body;

        // Sync developer with integrations if provided
        const finalIntegrations = developer || integrations;

        // 1. Update Server Identity (Workspace Name/Description)
        const serverUpdateData = {};
        if (general?.name) serverUpdateData.name = general.name;
        if (general?.description !== undefined) serverUpdateData.description = general.description;
        if (general?.imageUrl !== undefined) serverUpdateData.imageUrl = general.imageUrl;

        if (Object.keys(serverUpdateData).length > 0) {
            await prisma.server.update({
                where: { id: workspaceId },
                data: serverUpdateData
            });
        }

        // 2. Update Global App Settings (if branding provided)
        if (branding) {
            await prisma.appSettings.upsert({
                where: { key: 'APP_GENERAL' },
                create: {
                    key: 'APP_GENERAL',
                    social: branding
                },
                update: {
                    social: branding
                }
            });
        }

        // 3. Update Workspace-Specific Settings
        const workspaceUpdateData = {
            general: general || undefined, // Store socialLinks and other general settings here
            security: security || undefined,
            notifications: notifications || undefined,
            integrations: finalIntegrations || undefined,
            technical: advanced || undefined,
            privacy: privacy || undefined
        };

        // Filter out undefined to prevent clearing data
        const cleanUpdate = Object.fromEntries(
            Object.entries(workspaceUpdateData).filter(([_, v]) => v !== undefined)
        );

        if (Object.keys(cleanUpdate).length > 0) {
            await prisma.appSettings.upsert({
                where: { key: workspaceId },
                create: {
                    key: workspaceId,
                    ...cleanUpdate
                },
                update: cleanUpdate
            });
        }

        return NextResponse.json({
            message: "Settings updated successfully"
        });
    } catch (error) {
        console.error("PATCH Settings Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
