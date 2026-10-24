import { prisma } from "@/lib/prisma";
import { validateCrmUserToken } from "../_lib/auth";
import { apiSuccess, apiError } from "../_lib/response";

/**
 * POST /api/v5/crm/location
 * Log a single GPS point for the authenticated user.
 * Body: { lat, lng, accuracy?, altitude?, speed?, heading?, sessionId?, timestamp? }
 */
export async function POST(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        // GPS location logging is strictly mobile-only (never logged from web)
        if (!auth.isMobileClient) {
            return apiError("Location logging is strictly mobile-only.", 403);
        }

        const body = await request.json();
        const { lat, lng, accuracy, altitude, speed, heading, sessionId, timestamp } = body;

        if (lat === undefined || lng === undefined) {
            return apiError("lat and lng are required", 400);
        }

        const point = await prisma.userLocationPoint.create({
            data: {
                userId: auth.userId,
                workspaceId: auth.workspaceId || null,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                accuracy: accuracy !== undefined ? parseFloat(accuracy) : null,
                altitude: altitude !== undefined ? parseFloat(altitude) : null,
                speed: speed !== undefined ? parseFloat(speed) : null,
                heading: heading !== undefined ? parseFloat(heading) : null,
                sessionId: sessionId || null,
                timestamp: timestamp ? new Date(timestamp) : new Date(),
            },
        });

        return apiSuccess(point, { message: "Location logged" }, 201);
    } catch (error) {
        console.error("[API_LOCATION_POST_ERROR]", error);
        return apiError(error.message || "Failed to log location", 500);
    }
}

/**
 * GET /api/v5/crm/location
 * Fetch location trail for a user or all organization team members.
 * Query:
 *   - team=true: Returns all org team members with their latest location point + today's trail
 *   - userId?: Query specific user (defaults to authenticated user)
 *   - date?, sessionId?, startDate?, endDate?, limit?
 */
export async function GET(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { searchParams } = new URL(request.url);
        const isTeamQuery = searchParams.get("team") === "true" || searchParams.get("all") === "true";
        const platformFilter = searchParams.get("platform");
        const onlyMobile = platformFilter === "mobile" || auth.isMobileClient;

        // ── TEAM MODE: Return organization users with their latest location ────
        if (isTeamQuery) {
            // 1. Fetch Org Structure
            const globalRecord = await prisma.appSettings.findUnique({
                where: { key: "org_structure_global" },
            }).catch(() => null);

            let structure = null;
            if (globalRecord?.general && typeof globalRecord.general === "object") {
                structure = globalRecord.general;
            } else if (auth.workspaceId && auth.workspaceId !== "global") {
                const wsRecord = await prisma.appSettings.findUnique({
                    where: { key: `org_structure_${auth.workspaceId}` },
                }).catch(() => null);
                if (wsRecord?.general && typeof wsRecord.general === "object") {
                    structure = wsRecord.general;
                }
            }

            const nodes = structure?.nodes || {};
            const assignedUserIdsSet = new Set();
            const userOrgMeta = {};

            Object.values(nodes).forEach((node) => {
                if (Array.isArray(node.assignedUserIds)) {
                    node.assignedUserIds.forEach((uid) => {
                        if (uid) {
                            const cleanUid = String(uid);
                            assignedUserIdsSet.add(cleanUid);
                            if (!userOrgMeta[cleanUid]) {
                                userOrgMeta[cleanUid] = {
                                    title: node.title || "Team Member",
                                    department: node.department || "General",
                                    color: node.color,
                                };
                            }
                        }
                    });
                }
            });

            let assignedUserIds = Array.from(assignedUserIdsSet);

            let users = [];
            if (assignedUserIds.length > 0) {
                users = await prisma.user.findMany({
                    where: { id: { in: assignedUserIds } },
                    select: {
                        id: true,
                        displayName: true,
                        username: true,
                        email: true,
                        avatar: true,
                        role: true,
                        activeSession: true,
                    },
                    orderBy: { createdAt: "asc" },
                });
            } else {
                users = await prisma.user.findMany({
                    select: {
                        id: true,
                        displayName: true,
                        username: true,
                        email: true,
                        avatar: true,
                        role: true,
                        activeSession: true,
                    },
                    take: 6,
                    orderBy: { createdAt: "asc" },
                });
            }

            const USER_PALETTE = [
                "#0284c7", // Blue (CEO / Admin)
                "#10b981", // Emerald (Sales)
                "#8b5cf6", // Violet (Growth)
                "#f59e0b", // Amber (Ops)
                "#ec4899", // Pink (HR)
                "#06b6d4", // Cyan
            ];

            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            // Check if ANY point exists in DB to use as anchor lat/lng
            const anyPoint = await prisma.userLocationPoint.findFirst({
                orderBy: { timestamp: "desc" },
                select: { lat: true, lng: true },
            }).catch(() => null);

            const baseLat = anyPoint?.lat ? Number(anyPoint.lat) : 28.6139;
            const baseLng = anyPoint?.lng ? Number(anyPoint.lng) : 77.2090;

            const simulatedSpeeds = [1.2, 9.4, 0.5, 12.8, 1.6, 8.0]; // walking vs driving simulation

            const teamLocations = await Promise.all(
                users.map(async (u, idx) => {
                    const color = userOrgMeta[u.id]?.color || USER_PALETTE[idx % USER_PALETTE.length];

                    // Fetch user's latest point
                    let latestPoint = await prisma.userLocationPoint.findFirst({
                        where: { userId: u.id },
                        orderBy: { timestamp: "desc" },
                        select: {
                            id: true,
                            lat: true,
                            lng: true,
                            accuracy: true,
                            altitude: true,
                            speed: true,
                            heading: true,
                            timestamp: true,
                        },
                    }).catch(() => null);

                    // Fetch user's today trail
                    let trail = await prisma.userLocationPoint.findMany({
                        where: {
                            userId: u.id,
                            timestamp: { gte: todayStart },
                        },
                        orderBy: { timestamp: "asc" },
                        take: 500,
                        select: {
                            id: true,
                            lat: true,
                            lng: true,
                            speed: true,
                            timestamp: true,
                        },
                    }).catch(() => []);

                    // If user has not logged GPS points yet, provide visible location near team hub
                    if (!latestPoint) {
                        const offsetLat = (idx === 0 ? 0 : (idx % 2 === 0 ? 1 : -1) * 0.003 * Math.ceil(idx / 2));
                        const offsetLng = (idx === 0 ? 0 : (idx % 2 === 1 ? 1 : -1) * 0.0035 * Math.ceil(idx / 2));
                        const simSpeed = simulatedSpeeds[idx % simulatedSpeeds.length];

                        latestPoint = {
                            id: `sim-${u.id}`,
                            lat: baseLat + offsetLat,
                            lng: baseLng + offsetLng,
                            accuracy: 10,
                            speed: simSpeed,
                            heading: 90 * idx,
                            timestamp: new Date(),
                            isSimulated: true,
                        };
                    }

                    const speed = latestPoint.speed !== null && latestPoint.speed !== undefined
                        ? Number(latestPoint.speed)
                        : 0;

                    // Speed >= 2.5 m/s (~9 km/h) is classified as driving, below that is walking
                    const isDriving = speed >= 2.5;

                    const sessionData = u.activeSession;
                    const isMobileSession = Boolean(
                        (sessionData && typeof sessionData === "object" && (sessionData.platform === "mobile" || sessionData.platform === "android" || sessionData.platform === "ios")) ||
                        (u.id === auth.userId && auth.isMobileClient)
                    );
                    const isWebSession = Boolean(
                        sessionData && typeof sessionData === "object" && sessionData.platform === "web"
                    );

                    const platform = isMobileSession ? "mobile" : (isWebSession ? "web" : "offline");
                    const device = sessionData?.device || (platform === "mobile" ? "Mobile App" : (platform === "web" ? "Web Browser" : "Offline"));

                    return {
                        id: u.id,
                        name: u.displayName || u.username || u.email?.split("@")[0] || "Team Member",
                        email: u.email || "",
                        avatar: u.avatar || null,
                        role: userOrgMeta[u.id]?.title || u.role || "Team Member",
                        color,
                        isCurrent: u.id === auth.userId,
                        latestLocation: latestPoint,
                        speed,
                        speedKmH: Math.round(speed * 3.6),
                        isDriving,
                        activity: isDriving ? "driving" : (speed > 0.4 ? "walking" : "stationary"),
                        platform,
                        device,
                        activeSession: sessionData || null,
                        trail,
                    };
                })
            );

            let filteredTeam = teamLocations;
            if (onlyMobile) {
                // In mobile map mode, ONLY show users currently logged in on mobile (or current mobile user)
                filteredTeam = teamLocations.filter(
                    (u) => (u.platform === "mobile" && u.activeSession?.platform !== "web") || u.isCurrent
                );
            }

            return apiSuccess(
                { users: filteredTeam, totalUsers: filteredTeam.length },
                { message: "Team locations fetched" }
            );
        }

        // ── SINGLE USER MODE ────────────────────────────────────────────────────────
        const targetUserId = searchParams.get("userId") || auth.userId;
        const date = searchParams.get("date");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const sessionId = searchParams.get("sessionId");
        const limit = Math.min(parseInt(searchParams.get("limit") || "5000", 10), 10000);

        let timestampFilter = {};
        if (date) {
            const dayStart = new Date(`${date}T00:00:00.000Z`);
            const dayEnd = new Date(`${date}T23:59:59.999Z`);
            timestampFilter = { gte: dayStart, lte: dayEnd };
        } else if (startDate || endDate) {
            timestampFilter = {
                ...(startDate ? { gte: new Date(startDate) } : {}),
                ...(endDate ? { lte: new Date(endDate) } : {}),
            };
        }

        const points = await prisma.userLocationPoint.findMany({
            where: {
                userId: targetUserId,
                ...(Object.keys(timestampFilter).length > 0 ? { timestamp: timestampFilter } : {}),
                ...(sessionId ? { sessionId } : {}),
            },
            orderBy: { timestamp: "asc" },
            take: limit,
            select: {
                id: true,
                lat: true,
                lng: true,
                accuracy: true,
                altitude: true,
                speed: true,
                heading: true,
                sessionId: true,
                timestamp: true,
            },
        });

        const totalPoints = points.length;
        let totalDistanceMeters = 0;
        for (let i = 1; i < points.length; i++) {
            totalDistanceMeters += haversineMeters(points[i - 1], points[i]);
        }

        return apiSuccess(
            { points, totalPoints, totalDistanceMeters: Math.round(totalDistanceMeters) },
            { message: "Location trail fetched" }
        );
    } catch (error) {
        console.error("[API_LOCATION_GET_ERROR]", error);
        return apiError(error.message || "Failed to fetch location trail", 500);
    }
}

/**
 * DELETE /api/v5/crm/location
 * Clear trail. Query: sessionId? (if omitted, clears all for today).
 */
export async function DELETE(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const result = await prisma.userLocationPoint.deleteMany({
            where: {
                userId: auth.userId,
                ...(sessionId
                    ? { sessionId }
                    : { timestamp: { gte: today } }),
            },
        });

        return apiSuccess({ deleted: result.count }, { message: "Trail cleared" });
    } catch (error) {
        console.error("[API_LOCATION_DELETE_ERROR]", error);
        return apiError(error.message || "Failed to clear trail", 500);
    }
}

// ---------------------------------------------------------------------------
// Haversine helper (server-side, no dependency needed)
// ---------------------------------------------------------------------------
function haversineMeters(a, b) {
    const R = 6371000; // Earth radius in metres
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const sinA = Math.sin(dLat / 2);
    const sinB = Math.sin(dLng / 2);
    const c =
        sinA * sinA +
        Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinB * sinB;
    return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
}
