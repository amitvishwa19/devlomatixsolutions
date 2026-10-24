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
 * Fetch location trail for a user.
 * Query: userId? (admin override), date? (YYYY-MM-DD), sessionId?, startDate?, endDate?, limit?
 */
export async function GET(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { searchParams } = new URL(request.url);

        // Admins can query other users; otherwise use own userId
        const targetUserId = searchParams.get("userId") || auth.userId;

        const date = searchParams.get("date");          // "YYYY-MM-DD" — shorthand for a single day
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const sessionId = searchParams.get("sessionId");
        const limit = Math.min(parseInt(searchParams.get("limit") || "5000", 10), 10000);

        // Build timestamp filter
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

        // Compute simple stats
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
