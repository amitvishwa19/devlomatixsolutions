import { db } from "@/lib/db";
import { ok, fail, requireUserId } from "../_lib/helpers";

export const dynamic = "force-dynamic";

const REPORT_TYPES = ["messages", "campaigns", "templates", "contacts"];
const MAX_PAGE_SIZE = 200;

function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

/** `range` is a day count; "ALL" disables the date filter. */
function resolveStartDate(range) {
    if (!range || range === "ALL") return null;
    const days = Math.max(1, parseInt(range, 10) || 30);
    const d = startOfDay(new Date());
    d.setDate(d.getDate() - (days - 1));
    return d;
}

/** Metadata columns are Json but older rows store a JSON string. */
function parseMetadata(value) {
    if (!value) return {};
    if (typeof value === "object") return value;
    if (typeof value === "string" && value.trim().startsWith("{")) {
        try {
            return JSON.parse(value);
        } catch {
            return {};
        }
    }
    return {};
}

/** Last 10 digits, so `+9198…`, `9198…` and `98…` all match. */
function last10(value) {
    const digits = String(value || "").replace(/\D/g, "");
    return digits.slice(-10);
}

/**
 * GET /api/v5/konnectx/reports
 *
 * Query: reportType, range, status, search, page, pageSize.
 * Mirrors the web `getReports` action so both clients render the same rows.
 */
export async function GET(request) {
    try {
        const userId = await requireUserId(request);
        const { searchParams } = new URL(request.url);

        const reportType = searchParams.get("reportType") || "messages";
        if (!REPORT_TYPES.includes(reportType)) {
            return fail(`Invalid report type. Expected one of: ${REPORT_TYPES.join(", ")}`, 400);
        }

        const range = searchParams.get("range") || "30";
        const status = searchParams.get("status") || "ALL";
        const search = (searchParams.get("search") || "").trim();
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const pageSize = Math.min(
            MAX_PAGE_SIZE,
            Math.max(1, parseInt(searchParams.get("pageSize") || "25", 10))
        );
        const skip = (page - 1) * pageSize;
        const startDate = resolveStartDate(range);

        const workspaceId = searchParams.get("workspaceId");
        const pagination = (totalCount) => ({
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
            currentPage: page,
            pageSize
        });

        // ---------------------------------------------------- messages
        if (reportType === "messages") {
            const where = {
                userId,
                ...(startDate ? { createdAt: { gte: startDate } } : {})
            };

            if (status === "SENT") where.fromMe = true;
            else if (status === "INBOUND") where.fromMe = false;
            else if (status === "READ") where.status = "READ";
            else if (status === "FAILED") where.status = "FAILED";
            else if (status === "DELIVERED") where.status = { in: ["DELIVERED", "READ"] };

            if (search) {
                where.OR = [
                    { jid: { contains: search, mode: "insensitive" } },
                    { text: { contains: search, mode: "insensitive" } }
                ];
            }

            const [totalCount, messages, contacts] = await Promise.all([
                db.whatsAppMessage.count({ where }),
                db.whatsAppMessage.findMany({
                    where,
                    orderBy: { createdAt: "desc" },
                    skip,
                    take: pageSize,
                    select: {
                        id: true,
                        waId: true,
                        jid: true,
                        text: true,
                        fromMe: true,
                        status: true,
                        timestamp: true,
                        createdAt: true,
                        metadata: true
                    }
                }),
                db.contact.findMany({
                    where: { OR: [{ ...(workspaceId && { workspaceId }) }, { userId }] },
                    select: { name: true, phone: true }
                })
            ]);

            const nameByPhone = {};
            for (const contact of contacts) {
                const key = last10(contact.phone);
                if (key) nameByPhone[key] = contact.name;
            }

            const rows = messages.map((m) => {
                const meta = parseMetadata(m.metadata);
                const text = typeof m.text === "string" ? m.text : "";
                const isTemplate =
                    meta.type === "template" || text.startsWith("[Template:");
                const templateName =
                    meta.templateName ||
                    (text.startsWith("[Template:")
                        ? text.split("[Template:")[1]?.split("]")[0]
                        : null);

                return {
                    id: m.id,
                    waId: m.waId,
                    recipientPhone: (m.jid || "").replace(/\D/g, "").split("@")[0],
                    contactName: nameByPhone[last10(m.jid)] || meta.candidateName || meta.name || null,
                    direction: m.fromMe ? "OUTBOUND" : "INBOUND",
                    type: isTemplate ? "TEMPLATE" : (meta.type || "TEXT").toUpperCase(),
                    templateName: templateName || null,
                    text: m.text,
                    status: m.status || (m.fromMe ? "SENT" : "RECEIVED"),
                    createdAt: (m.createdAt || new Date()).toISOString()
                };
            });

            return ok({ reportType, pagination: pagination(totalCount), rows });
        }

        // ---------------------------------------------------- campaigns
        if (reportType === "campaigns") {
            const where = {
                userId,
                ...(startDate ? { createdAt: { gte: startDate } } : {}),
                ...(search ? { name: { contains: search, mode: "insensitive" } } : {})
            };

            const [totalCount, campaigns] = await Promise.all([
                db.campaign.count({ where }),
                db.campaign.findMany({
                    where,
                    include: {
                        _count: { select: { recipients: true } },
                        recipients: { select: { status: true } },
                        template: { select: { name: true } }
                    },
                    orderBy: { createdAt: "desc" },
                    skip,
                    take: pageSize
                })
            ]);

            const rows = campaigns.map((c) => {
                const total = c._count.recipients || 0;
                const sent = c.recipients.filter((r) => r.status === "SENT").length;
                const failed = c.recipients.filter((r) => r.status === "FAILED").length;

                return {
                    id: c.id,
                    name: c.name,
                    status: c.status,
                    templateName: c.template?.name || "Custom Message",
                    messageType: c.messageType,
                    totalRecipients: total,
                    sentCount: sent,
                    failedCount: failed,
                    successRate: `${total > 0 ? Math.round((sent / total) * 100) : 0}%`,
                    scheduledAt: c.scheduledAt ? new Date(c.scheduledAt).toISOString() : null,
                    createdAt: new Date(c.createdAt).toISOString()
                };
            });

            return ok({ reportType, pagination: pagination(totalCount), rows });
        }

        // ---------------------------------------------------- templates
        if (reportType === "templates") {
            const where = {
                userId,
                ...(search ? { name: { contains: search, mode: "insensitive" } } : {})
            };

            // Bucket outbound messages by template name once, instead of
            // re-scanning the whole set for every template row.
            const [totalCount, templates, outbound] = await Promise.all([
                db.messageTemplate.count({ where }),
                db.messageTemplate.findMany({
                    where,
                    orderBy: { createdAt: "desc" },
                    skip,
                    take: pageSize
                }),
                db.whatsAppMessage.findMany({
                    where: {
                        userId,
                        fromMe: true,
                        ...(startDate ? { createdAt: { gte: startDate } } : {})
                    },
                    select: { text: true, metadata: true, status: true }
                })
            ]);

            const statsByTemplate = new Map();
            for (const m of outbound) {
                const meta = parseMetadata(m.metadata);
                const text = typeof m.text === "string" ? m.text : "";
                const name =
                    meta.templateName || meta.originalPayload?.template?.name || null;
                const key = name
                    ? name.toLowerCase()
                    : text.startsWith("[Template:")
                        ? text.split("[Template:")[1]?.split("]")[0]?.toLowerCase()
                        : null;
                if (!key) continue;

                const bucket = statsByTemplate.get(key) || { sent: 0, read: 0, failed: 0 };
                bucket.sent += 1;
                if (m.status === "READ") bucket.read += 1;
                if (m.status === "FAILED") bucket.failed += 1;
                statsByTemplate.set(key, bucket);
            }

            const rows = templates.map((t) => {
                const bucket =
                    statsByTemplate.get((t.templateName || t.name || "").toLowerCase()) || {
                        sent: 0,
                        read: 0,
                        failed: 0
                    };
                const deliveryRate =
                    bucket.sent > 0
                        ? `${(((bucket.sent - bucket.failed) / bucket.sent) * 100).toFixed(1)}%`
                        : "100.0%";

                return {
                    id: t.id,
                    name: t.name,
                    category: t.category || "MARKETING",
                    language: t.language || "en_US",
                    type: t.type || "TEXT",
                    status: t.status || "APPROVED",
                    sentCount: bucket.sent,
                    readCount: bucket.read,
                    failedCount: bucket.failed,
                    deliveryRate,
                    createdAt: new Date(t.createdAt).toISOString()
                };
            });

            return ok({ reportType, pagination: pagination(totalCount), rows });
        }

        // ---------------------------------------------------- contacts
        const where = {
            OR: [{ ...(workspaceId && { workspaceId }) }, { userId }],
            ...(search
                ? {
                    AND: [
                        {
                            OR: [
                                { name: { contains: search, mode: "insensitive" } },
                                { phone: { contains: search } },
                                { email: { contains: search, mode: "insensitive" } }
                            ]
                        }
                    ]
                }
                : {})
        };

        const [totalCount, contacts, allAgg, inboundAgg] = await Promise.all([
            db.contact.count({ where }),
            db.contact.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize
            }),
            // Aggregate in SQL by sender jid — one row per phone rather than
            // one per message, so this stays cheap on large histories.
            db.whatsAppMessage.groupBy({
                by: ["jid"],
                where: { userId },
                _count: { _all: true },
                _max: { createdAt: true }
            }),
            // `fromMe` is a boolean, so it cannot be SUMmed in Postgres —
            // inbound is counted with its own grouped query instead.
            db.whatsAppMessage.groupBy({
                by: ["jid"],
                where: { userId, fromMe: false },
                _count: { _all: true }
            })
        ]);

        const inboundByPhone = new Map();
        for (const group of inboundAgg) {
            const key = last10(group.jid);
            if (key) inboundByPhone.set(key, group._count._all);
        }

        const engagementByPhone = new Map();
        for (const group of allAgg) {
            const key = last10(group.jid);
            if (!key) continue;
            engagementByPhone.set(key, {
                totalInteractions: group._count._all,
                inboundReplies: inboundByPhone.get(key) || 0,
                lastInteraction: group._max.createdAt
                    ? new Date(group._max.createdAt).toISOString()
                    : null
            });
        }

        const rows = contacts.map((c) => {
            const stats = engagementByPhone.get(last10(c.phone)) || {
                totalInteractions: 0,
                inboundReplies: 0,
                lastInteraction: null
            };

            return {
                id: c.id,
                name: c.name || "Unnamed Contact",
                phone: c.phone,
                email: c.email || "N/A",
                totalInteractions: stats.totalInteractions,
                inboundReplies: stats.inboundReplies,
                lastInteraction: stats.lastInteraction,
                createdAt: new Date(c.createdAt).toISOString()
            };
        });

        return ok({ reportType: "contacts", pagination: pagination(totalCount), rows });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/reports] GET failed:", error);
        return fail(error.message || "Failed to fetch reports", 500);
    }
}