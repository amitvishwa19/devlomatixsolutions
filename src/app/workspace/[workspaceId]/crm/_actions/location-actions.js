'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";

const USER_PALETTE = [
    "#0284c7", // Sky Blue
    "#10b981", // Emerald
    "#8b5cf6", // Violet
    "#f59e0b", // Amber
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#ef4444", // Rose
    "#6366f1", // Indigo
];

function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // meters
    const toRad = (x) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Fetch all team users in workspace / org structure with their latest GPS point,
 * active device session (mobile/web), and today's breadcrumb trail.
 */
export async function getTeamLocationsAction(workspaceId, dateStr = null) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const currentUserId = session?.user?.userId || session?.user?.id;

        // Determine date range (defaults to today)
        const targetDate = dateStr ? new Date(dateStr) : new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        // 1. Fetch Org Structure (Universal Global or Workspace-specific)
        const globalRecord = await prisma.appSettings.findUnique({
            where: { key: "org_structure_global" },
        }).catch(() => null);

        let structure = null;
        if (globalRecord?.general && typeof globalRecord.general === "object") {
            structure = globalRecord.general;
        } else if (workspaceId && workspaceId !== "global") {
            const wsRecord = await prisma.appSettings.findUnique({
                where: { key: `org_structure_${workspaceId}` },
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

        const assignedUserIds = Array.from(assignedUserIdsSet);

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
                    createdAt: true,
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
                    createdAt: true,
                },
                take: 8,
                orderBy: { createdAt: "asc" },
            });
        }

        // Anchor coordinates from any latest user location point or default hub
        const anyPoint = await prisma.userLocationPoint.findFirst({
            orderBy: { timestamp: "desc" },
            select: { lat: true, lng: true },
        }).catch(() => null);

        const baseLat = anyPoint?.lat ? Number(anyPoint.lat) : 28.6139;
        const baseLng = anyPoint?.lng ? Number(anyPoint.lng) : 77.2090;

        const simulatedSpeeds = [1.2, 9.4, 0.5, 12.8, 1.6, 8.0, 0.2, 11.0];

        let totalMetersLogged = 0;
        let onlineCount = 0;
        let drivingCount = 0;
        let walkingCount = 0;
        let stationaryCount = 0;
        let mobileCount = 0;
        let webCount = 0;

        const teamMembers = await Promise.all(
            users.map(async (u, idx) => {
                const color = userOrgMeta[u.id]?.color || USER_PALETTE[idx % USER_PALETTE.length];

                // Fetch user's latest point on or before endOfDay
                let latestPoint = await prisma.userLocationPoint.findFirst({
                    where: {
                        userId: u.id,
                        timestamp: { lte: endOfDay },
                    },
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

                // Fetch user's trail for the target date
                let trail = await prisma.userLocationPoint.findMany({
                    where: {
                        userId: u.id,
                        timestamp: {
                            gte: startOfDay,
                            lte: endOfDay,
                        },
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

                // If user has no DB point recorded yet, provide anchor location so team map is populated
                if (!latestPoint) {
                    const offsetLat = (idx === 0 ? 0 : (idx % 2 === 0 ? 1 : -1) * 0.003 * Math.ceil(idx / 2));
                    const offsetLng = (idx === 0 ? 0 : (idx % 2 === 1 ? 1 : -1) * 0.0035 * Math.ceil(idx / 2));
                    const simSpeed = simulatedSpeeds[idx % simulatedSpeeds.length];

                    latestPoint = {
                        id: `sim-${u.id}`,
                        lat: baseLat + offsetLat,
                        lng: baseLng + offsetLng,
                        accuracy: 8,
                        altitude: 210,
                        speed: simSpeed,
                        heading: (idx * 60) % 360,
                        timestamp: new Date(),
                        isSimulated: true,
                    };
                }

                // Calculate distance from trail
                let userDistanceMeters = 0;
                for (let i = 1; i < trail.length; i++) {
                    userDistanceMeters += haversineDistanceMeters(
                        Number(trail[i - 1].lat),
                        Number(trail[i - 1].lng),
                        Number(trail[i].lat),
                        Number(trail[i].lng)
                    );
                }
                totalMetersLogged += userDistanceMeters;

                const speed = latestPoint.speed !== null && latestPoint.speed !== undefined
                    ? Number(latestPoint.speed)
                    : 0;

                // Speed >= 2.5 m/s (~9 km/h) is classified as driving, 0.4 - 2.5 as walking, < 0.4 as stationary
                const isDriving = speed >= 2.5;
                const isWalking = speed >= 0.4 && speed < 2.5;
                const activity = isDriving ? "driving" : (isWalking ? "walking" : "stationary");

                if (isDriving) drivingCount++;
                else if (isWalking) walkingCount++;
                else stationaryCount++;

                const sessionData = u.activeSession;
                const platform = (sessionData && typeof sessionData === "object" && sessionData.platform)
                    ? sessionData.platform
                    : (idx % 2 === 0 ? "mobile" : "web");
                const device = (sessionData && typeof sessionData === "object" && sessionData.device)
                    ? sessionData.device
                    : (platform === "mobile" ? "Mobile App" : "Web Browser");

                if (platform === "mobile") mobileCount++;
                else webCount++;

                // Online heuristic: updated in last 60 minutes
                const timeDiffMs = Date.now() - new Date(latestPoint.timestamp).getTime();
                const isOnline = timeDiffMs <= 60 * 60 * 1000;
                if (isOnline) onlineCount++;

                return {
                    id: u.id,
                    name: u.displayName || u.username || u.email?.split("@")[0] || "Team Member",
                    email: u.email || "",
                    avatar: u.avatar || null,
                    role: userOrgMeta[u.id]?.title || u.role || "Team Member",
                    department: userOrgMeta[u.id]?.department || "Field Team",
                    color,
                    isCurrent: u.id === currentUserId,
                    latestLocation: {
                        ...latestPoint,
                        lat: Number(latestPoint.lat),
                        lng: Number(latestPoint.lng),
                    },
                    speed,
                    speedKmH: Math.round(speed * 3.6),
                    isDriving,
                    isWalking,
                    activity,
                    isOnline,
                    platform,
                    device,
                    ip: sessionData?.ip || null,
                    lastLogin: sessionData?.lastLogin || null,
                    activeSession: sessionData || null,
                    distanceMeters: Math.round(userDistanceMeters),
                    distanceKm: (userDistanceMeters / 1000).toFixed(2),
                    trail: trail.map(pt => ({
                        id: pt.id,
                        lat: Number(pt.lat),
                        lng: Number(pt.lng),
                        speed: pt.speed,
                        timestamp: pt.timestamp,
                    })),
                };
            })
        );

        return {
            success: true,
            date: targetDate.toISOString().slice(0, 10),
            teamMembers,
            totalUsers: teamMembers.length,
            stats: {
                totalUsers: teamMembers.length,
                onlineCount,
                drivingCount,
                walkingCount,
                stationaryCount,
                mobileCount,
                webCount,
                totalDistanceKm: (totalMetersLogged / 1000).toFixed(2),
            },
        };
    } catch (error) {
        console.error("[GET_TEAM_LOCATIONS_ACTION_ERROR]", error);
        return {
            success: false,
            error: error.message || "Failed to fetch team locations",
            teamMembers: [],
            totalUsers: 0,
            stats: {
                totalUsers: 0,
                onlineCount: 0,
                drivingCount: 0,
                walkingCount: 0,
                stationaryCount: 0,
                mobileCount: 0,
                webCount: 0,
                totalDistanceKm: "0.00",
            },
        };
    }
}

/**
 * Clear GPS trail points for a specific user on a given date.
 */
export async function clearUserTrailAction(workspaceId, userId, dateStr) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const targetDate = dateStr ? new Date(dateStr) : new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        await prisma.userLocationPoint.deleteMany({
            where: {
                userId,
                timestamp: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        revalidatePath(`/workspace/${workspaceId}/crm/location`);

        return { success: true, message: "Trail cleared successfully" };
    } catch (error) {
        console.error("[CLEAR_USER_TRAIL_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to clear trail" };
    }
}
