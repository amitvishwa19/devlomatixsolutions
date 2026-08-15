import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// GET visitor telemetry & aggregated analytics
export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "25");
        const country = searchParams.get("country");
        const device = searchParams.get("device");
        const search = searchParams.get("search");
        const dateRange = searchParams.get("dateRange") || "all";

        // Build Where Clause
        const where = {
            OR: [
                { workspaceId: workspaceId },
                { workspaceId: null }
            ]
        };

        // Date filter
        if (dateRange !== "all") {
            const now = new Date();
            let startDate = new Date();
            if (dateRange === "24h") startDate.setHours(now.getHours() - 24);
            else if (dateRange === "7d") startDate.setDate(now.getDate() - 7);
            else if (dateRange === "30d") startDate.setDate(now.getDate() - 30);
            where.createdAt = { gte: startDate };
        }

        // Country & Device filters
        if (country && country !== "ALL") where.countryCode = country;
        if (device && device !== "ALL") where.device = device;

        // Search Query
        if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            where.AND = [
                ...(where.AND || []),
                {
                    OR: [
                        { ipAddress: { contains: q, mode: 'insensitive' } },
                        { path: { contains: q, mode: 'insensitive' } },
                        { city: { contains: q, mode: 'insensitive' } },
                        { country: { contains: q, mode: 'insensitive' } },
                        { browser: { contains: q, mode: 'insensitive' } },
                        { os: { contains: q, mode: 'insensitive' } },
                        { title: { contains: q, mode: 'insensitive' } },
                        { referrer: { contains: q, mode: 'insensitive' } }
                    ]
                }
            ];
        }

        const skip = (page - 1) * limit;

        // Fetch logs and total count
        const [logs, total] = await Promise.all([
            prisma.visitorLog.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit
            }),
            prisma.visitorLog.count({ where })
        ]);

        // Compute Aggregated Analytics
        const allLogsForStats = await prisma.visitorLog.findMany({
            where: {
                OR: [
                    { workspaceId: workspaceId },
                    { workspaceId: null }
                ]
            },
            select: {
                id: true,
                sessionId: true,
                ipAddress: true,
                country: true,
                countryCode: true,
                path: true,
                device: true,
                duration: true
            },
            take: 1000
        });

        // Unique Visitors (distinct sessionId or ipAddress)
        const uniqueSet = new Set(allLogsForStats.map(l => l.sessionId || l.ipAddress).filter(Boolean));

        // Average Duration in seconds
        const totalDuration = allLogsForStats.reduce((acc, l) => acc + (l.duration || 0), 0);
        const avgDuration = allLogsForStats.length > 0 ? Math.round(totalDuration / allLogsForStats.length) : 0;

        // Country Counts
        const countryMap = {};
        // Page Counts
        const pageMap = {};
        // Device Counts
        const deviceStats = { Desktop: 0, Mobile: 0, Tablet: 0, Other: 0 };

        allLogsForStats.forEach(l => {
            // Country
            const cKey = l.countryCode || "UN";
            if (!countryMap[cKey]) {
                countryMap[cKey] = { code: cKey, country: l.country || "Unknown", count: 0 };
            }
            countryMap[cKey].count++;

            // Page
            const pKey = l.path || "/";
            pageMap[pKey] = (pageMap[pKey] || 0) + 1;

            // Device
            if (l.device && deviceStats[l.device] !== undefined) {
                deviceStats[l.device]++;
            } else {
                deviceStats.Other++;
            }
        });

        const topCountries = Object.values(countryMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const topPages = Object.entries(pageMap)
            .map(([path, count]) => ({ path, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Fetch workspace settings for visitor logging status
        const workspaceSettings = await prisma.appSettings.findUnique({
            where: { key: workspaceId }
        });
        const visitorLoggingEnabled = workspaceSettings?.privacy?.visitorLoggingEnabled !== false;

        return NextResponse.json({
            logs,
            visitorLoggingEnabled,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit) || 1
            },
            stats: {
                totalVisits: total,
                uniqueVisitors: uniqueSet.size,
                avgDuration,
                topCountries,
                topPages,
                deviceStats
            }
        });
    } catch (error) {
        console.error("GET Visitor Logs Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH update visitor logging setting
export async function PATCH(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { visitorLoggingEnabled } = body || {};

        if (typeof visitorLoggingEnabled !== "boolean") {
            return NextResponse.json({ message: "visitorLoggingEnabled boolean required" }, { status: 400 });
        }

        const existing = await prisma.appSettings.findUnique({
            where: { key: workspaceId }
        });

        const currentPrivacy = (typeof existing?.privacy === 'object' && existing?.privacy) ? existing.privacy : {};

        await prisma.appSettings.upsert({
            where: { key: workspaceId },
            create: {
                key: workspaceId,
                privacy: { ...currentPrivacy, visitorLoggingEnabled }
            },
            update: {
                privacy: { ...currentPrivacy, visitorLoggingEnabled }
            }
        });

        return NextResponse.json({
            message: `Visitor logging ${visitorLoggingEnabled ? 'enabled' : 'disabled'}`,
            visitorLoggingEnabled
        });
    } catch (error) {
        console.error("PATCH Visitor Log Settings Error:", error);
        return NextResponse.json({ message: "Failed to update visitor logging status" }, { status: 500 });
    }
}

// DELETE visitor logs
export async function DELETE(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const clearAll = searchParams.get("clearAll") === "true";
        const olderThan30d = searchParams.get("olderThan30d") === "true";
        const id = searchParams.get("id");
        const ids = searchParams.get("ids");

        if (clearAll) {
            await prisma.visitorLog.deleteMany({
                where: {
                    OR: [
                        { workspaceId: workspaceId },
                        { workspaceId: null }
                    ]
                }
            });
            return NextResponse.json({ message: "All visitor logs cleared" });
        }

        if (olderThan30d) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            await prisma.visitorLog.deleteMany({
                where: {
                    createdAt: { lt: thirtyDaysAgo }
                }
            });
            return NextResponse.json({ message: "Logs older than 30 days cleared" });
        }

        if (ids) {
            const idList = ids.split(",").map(i => i.trim()).filter(Boolean);
            await prisma.visitorLog.deleteMany({
                where: { id: { in: idList } }
            });
            return NextResponse.json({ message: `${idList.length} logs deleted` });
        }

        if (id) {
            await prisma.visitorLog.delete({ where: { id } });
            return NextResponse.json({ message: "Log deleted" });
        }

        return NextResponse.json({ message: "Invalid delete parameters" }, { status: 400 });
    } catch (error) {
        console.error("DELETE Visitor Logs Error:", error);
        return NextResponse.json({ message: "Failed to delete visitor logs" }, { status: 500 });
    }
}
