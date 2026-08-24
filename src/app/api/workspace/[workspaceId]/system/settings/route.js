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

        // 1. Fetch Global Settings (Row 1: key = 'global')
        let globalSettings = await prisma.appSettings.findUnique({
            where: { key: 'global' }
        }).catch(() => null);

        if (!globalSettings) {
            globalSettings = await prisma.appSettings.create({
                data: {
                    key: 'global',
                    social: {
                        primaryColor: "#3b82f6",
                        logoUrl: workspace.imageUrl || "",
                        appName: "Devlomatix",
                        appDescription: "Your Productivity Platform",
                        workspaceUrl: `http://localhost:3000`
                    }
                }
            }).catch(() => null);
        }

        // 2. Fetch Workspace-Specific Settings (Row 2: key = workspaceId)
        let workspaceSettings = await prisma.appSettings.findUnique({
            where: { key: workspaceId }
        }).catch(() => null);

        if (!workspaceSettings) {
            workspaceSettings = await prisma.appSettings.create({
                data: {
                    key: workspaceId,
                    general: {
                        name: workspace.name,
                        description: workspace.description || "",
                        imageUrl: workspace.imageUrl || "",
                    },
                    security: {
                        mfaEnabled: false,
                        sessionTimeout: 3600,
                        passwordPolicy: "standard",
                    },
                    notifications: {
                        whatsapp: true,
                        email: true,
                        push: false,
                    },
                    privacy: {
                        dataRetention: 365,
                        gdprCompliant: true,
                        activityLogging: true,
                        visitorLoggingEnabled: true,
                    }
                }
            }).catch(() => null);
        }

        // Safely resolve JSON fields
        const glSocial = (typeof globalSettings?.social === 'object' && globalSettings?.social) ? globalSettings.social : {};
        const glGeneral = (typeof globalSettings?.general === 'object' && globalSettings?.general) ? globalSettings.general : {};
        const glSecurity = (typeof globalSettings?.security === 'object' && globalSettings?.security) ? globalSettings.security : {};
        const glNotifications = (typeof globalSettings?.notifications === 'object' && globalSettings?.notifications) ? globalSettings.notifications : {};
        const glIntegrations = (typeof globalSettings?.integrations === 'object' && globalSettings?.integrations) ? globalSettings.integrations : {};
        const glTechnical = (typeof globalSettings?.technical === 'object' && globalSettings?.technical) ? globalSettings.technical : {};
        const glPrivacy = (typeof globalSettings?.privacy === 'object' && globalSettings?.privacy) ? globalSettings.privacy : {};

        const wsGeneral = (typeof workspaceSettings?.general === 'object' && workspaceSettings?.general) ? workspaceSettings.general : {};
        const wsSecurity = (typeof workspaceSettings?.security === 'object' && workspaceSettings?.security) ? workspaceSettings.security : {};
        const wsNotifications = (typeof workspaceSettings?.notifications === 'object' && workspaceSettings?.notifications) ? workspaceSettings.notifications : {};
        const wsIntegrations = (typeof workspaceSettings?.integrations === 'object' && workspaceSettings?.integrations) ? workspaceSettings.integrations : {};
        const wsTechnical = (typeof workspaceSettings?.technical === 'object' && workspaceSettings?.technical) ? workspaceSettings.technical : {};
        const wsPrivacy = (typeof workspaceSettings?.privacy === 'object' && workspaceSettings?.privacy) ? workspaceSettings.privacy : {};

        // Default Branding
        const defaultBranding = {
            primaryColor: "#3b82f6",
            logoUrl: workspace.imageUrl || "",
            logoLightUrl: "",
            logoDarkUrl: "",
            appName: "Devlomatix",
            appDescription: "Your Productivity Platform",
            workspaceUrl: `http://localhost:3000`
        };

        const mergedBranding = {
            ...defaultBranding,
            ...glSocial,
            ...glGeneral,
        };

        const settings = {
            general: {
                name: workspace.name,
                description: workspace.description || "",
                imageUrl: workspace.imageUrl || "",
                inviteCode: workspace.inviteCode,
                socialLinks: wsGeneral.socialLinks || glGeneral.socialLinks || glSocial.socialLinks || {},
                ...glGeneral,
                ...wsGeneral,
            },
            branding: {
                ...mergedBranding,
                socialLinks: wsGeneral.socialLinks || glSocial.socialLinks || {}
            },
            security: {
                mfaEnabled: false,
                sessionTimeout: 3600,
                passwordPolicy: "standard",
                ...glSecurity,
                ...wsSecurity,
            },
            notifications: {
                whatsapp: true,
                email: true,
                push: false,
                ...glNotifications,
                ...wsNotifications,
            },
            integrations: {
                webhooks: [],
                apiKeys: [],
                ...glIntegrations,
                ...wsIntegrations,
            },
            developer: {
                webhooks: [],
                apiKeys: [],
                ...glIntegrations,
                ...wsIntegrations,
            },
            advanced: {
                maintenanceMode: false,
                customCss: "",
                ...glTechnical,
                ...wsTechnical,
            },
            privacy: {
                dataRetention: 365,
                gdprCompliant: true,
                activityLogging: true,
                visitorLoggingEnabled: true,
                ...glPrivacy,
                ...wsPrivacy,
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

        // Verify ownership or admin role
        const workspace = await prisma.server.findUnique({
            where: { id: workspaceId }
        });

        if (!workspace || workspace.userId !== session.user.userId) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { general, branding, security, notifications, integrations, developer, advanced, privacy } = body;

        // Sync developer with integrations if provided
        const finalIntegrations = developer || integrations;

        // 1. Update Server Identity (Workspace Name/Description/Image)
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

        // 2. Update Global Branding (Row 1: key = 'global')
        if (branding) {
            await prisma.appSettings.upsert({
                where: { key: 'global' },
                create: {
                    key: 'global',
                    social: branding
                },
                update: {
                    social: branding
                }
            });
        }

        // 3. Update Workspace-Specific Settings (Row 2: key = workspaceId)
        const workspaceUpdateData = {
            general: general || undefined,
            security: security || undefined,
            notifications: notifications || undefined,
            integrations: finalIntegrations || undefined,
            technical: advanced || undefined,
            privacy: privacy || undefined
        };

        const cleanWorkspaceUpdate = Object.fromEntries(
            Object.entries(workspaceUpdateData).filter(([_, v]) => v !== undefined)
        );

        // Always ensure the workspace row exists and is kept in sync
        await prisma.appSettings.upsert({
            where: { key: workspaceId },
            create: {
                key: workspaceId,
                general: general || {},
                security: security || {},
                notifications: notifications || {},
                integrations: finalIntegrations || {},
                technical: advanced || {},
                privacy: privacy || {}
            },
            update: cleanWorkspaceUpdate
        });

        return NextResponse.json({
            message: "Settings updated successfully"
        });
    } catch (error) {
        console.error("PATCH Settings Error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error?.message || String(error) }, { status: 500 });
    }
}
