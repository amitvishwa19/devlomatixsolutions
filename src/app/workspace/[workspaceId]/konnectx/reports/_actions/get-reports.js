'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { startOfDay, subDays } from "date-fns";

const GetReportsSchema = z.object({
    workspaceId: z.string(),
    reportType: z.enum(['messages', 'campaigns', 'templates', 'contacts']).optional().default('messages'),
    range: z.string().optional().default('30'),
    status: z.string().optional().default('ALL'),
    search: z.string().optional().default(''),
    page: z.number().int().min(1).optional().default(1),
    pageSize: z.number().int().min(1).max(200).optional().default(25)
});

const handler = async (data) => {
    const { workspaceId, reportType, range, status, search, page, pageSize } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // Resolve workspace team user IDs
        const workspace = await db.server.findUnique({
            where: { id: workspaceId },
            include: { members: true }
        }).catch(() => null);

        const workspaceUserIds = [
            ...new Set([
                userId,
                workspace?.userId,
                ...((workspace?.members || []).map(m => m.userId))
            ].filter(Boolean))
        ];

        let startDate = null;
        if (range !== 'ALL') {
            const daysToSub = Math.max(1, parseInt(range) - 1);
            startDate = startOfDay(subDays(new Date(), daysToSub));
        }

        // ==========================================
        // 1. MESSAGES LOGS & DELIVERY REPORT
        // ==========================================
        if (reportType === 'messages') {
            const whereClause = {
                userId: { in: workspaceUserIds },
                ...(startDate ? { createdAt: { gte: startDate } } : {}),
            };

            if (status === 'SENT') {
                whereClause.fromMe = true;
            } else if (status === 'INBOUND') {
                whereClause.fromMe = false;
            } else if (status === 'READ') {
                whereClause.status = 'READ';
            } else if (status === 'FAILED') {
                whereClause.status = 'FAILED';
            } else if (status === 'DELIVERED') {
                whereClause.status = { in: ['DELIVERED', 'READ'] };
            }

            if (search && search.trim() !== '') {
                whereClause.OR = [
                    { jid: { contains: search.trim(), mode: 'insensitive' } },
                    { text: { contains: search.trim(), mode: 'insensitive' } }
                ];
            }

            const [totalCount, messages, contacts] = await Promise.all([
                db.whatsAppMessage.count({ where: whereClause }),
                db.whatsAppMessage.findMany({
                    where: whereClause,
                    orderBy: { createdAt: 'desc' },
                    skip: (page - 1) * pageSize,
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
                    where: { OR: [{ workspaceId }, { userId: { in: workspaceUserIds } }] },
                    select: { name: true, phone: true }
                })
            ]);

            const contactMap = {};
            contacts.forEach(c => {
                const digits = (c.phone || '').replace(/\D/g, '');
                const last10 = digits.slice(-10);
                if (last10) contactMap[last10] = c.name;
            });

            const rows = messages.map(m => {
                const cleanPhone = (m.jid || '').replace(/\D/g, '').split('@')[0];
                const last10 = cleanPhone.slice(-10);
                const contactName = contactMap[last10] || null;

                let meta = m.metadata;
                if (typeof meta === 'string' && meta.startsWith('{')) {
                    try { meta = JSON.parse(meta); } catch (e) { }
                }
                meta = meta || {};

                const isTemplate = meta.type === 'template' || (typeof m.text === 'string' && m.text.startsWith('[Template:'));
                const templateName = meta.templateName || (typeof m.text === 'string' && m.text.startsWith('[Template:') ? m.text.split('[Template:')[1]?.split(']')[0] : null);

                return {
                    id: m.id,
                    waId: m.waId,
                    recipientPhone: cleanPhone,
                    contactName: contactName || meta.candidateName || meta.name || null,
                    direction: m.fromMe ? 'OUTBOUND' : 'INBOUND',
                    type: isTemplate ? 'TEMPLATE' : (meta.type || 'TEXT').toUpperCase(),
                    templateName: templateName || null,
                    text: m.text,
                    status: m.status || (m.fromMe ? 'SENT' : 'RECEIVED'),
                    createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString()
                };
            });

            return {
                data: {
                    success: true,
                    reportType: 'messages',
                    pagination: {
                        totalCount,
                        totalPages: Math.ceil(totalCount / pageSize),
                        currentPage: page,
                        pageSize
                    },
                    rows
                }
            };
        }

        // ==========================================
        // 2. CAMPAIGNS BROADCAST REPORT
        // ==========================================
        if (reportType === 'campaigns') {
            const whereClause = {
                userId: { in: workspaceUserIds },
                ...(startDate ? { createdAt: { gte: startDate } } : {})
            };

            if (search && search.trim() !== '') {
                whereClause.name = { contains: search.trim(), mode: 'insensitive' };
            }

            const [totalCount, campaigns] = await Promise.all([
                db.campaign.count({ where: whereClause }),
                db.campaign.findMany({
                    where: whereClause,
                    include: {
                        _count: { select: { recipients: true } },
                        recipients: { select: { status: true } },
                        template: { select: { name: true } }
                    },
                    orderBy: { createdAt: 'desc' },
                    skip: (page - 1) * pageSize,
                    take: pageSize
                })
            ]);

            const rows = campaigns.map(c => {
                const total = c._count.recipients || 0;
                const sent = c.recipients.filter(r => r.status === 'SENT').length;
                const failed = c.recipients.filter(r => r.status === 'FAILED').length;
                const successRate = total > 0 ? Math.round((sent / total) * 100) : 0;

                return {
                    id: c.id,
                    name: c.name,
                    status: c.status,
                    templateName: c.template?.name || 'Custom Message',
                    messageType: c.messageType,
                    totalRecipients: total,
                    sentCount: sent,
                    failedCount: failed,
                    successRate: `${successRate}%`,
                    scheduledAt: c.scheduledAt ? new Date(c.scheduledAt).toISOString() : null,
                    createdAt: new Date(c.createdAt).toISOString()
                };
            });

            return {
                data: {
                    success: true,
                    reportType: 'campaigns',
                    pagination: {
                        totalCount,
                        totalPages: Math.ceil(totalCount / pageSize),
                        currentPage: page,
                        pageSize
                    },
                    rows
                }
            };
        }

        // ==========================================
        // 3. META TEMPLATES USAGE REPORT
        // ==========================================
        if (reportType === 'templates') {
            const whereClause = {
                userId: { in: workspaceUserIds }
            };

            if (search && search.trim() !== '') {
                whereClause.name = { contains: search.trim(), mode: 'insensitive' };
            }

            const [totalCount, templates, allMessages] = await Promise.all([
                db.messageTemplate.count({ where: whereClause }),
                db.messageTemplate.findMany({
                    where: whereClause,
                    orderBy: { createdAt: 'desc' },
                    skip: (page - 1) * pageSize,
                    take: pageSize
                }),
                db.whatsAppMessage.findMany({
                    where: { 
                        userId: { in: workspaceUserIds },
                        fromMe: true,
                        ...(startDate ? { createdAt: { gte: startDate } } : {})
                    },
                    select: { text: true, metadata: true, status: true }
                })
            ]);

            const rows = templates.map(t => {
                const tplKey = (t.templateName || t.name).toLowerCase();
                const matched = allMessages.filter(m => {
                    let meta = m.metadata;
                    if (typeof meta === 'string' && meta.startsWith('{')) {
                        try { meta = JSON.parse(meta); } catch (e) { }
                    }
                    const metaName = meta?.templateName || meta?.originalPayload?.template?.name;
                    if (metaName && metaName.toLowerCase() === tplKey) return true;
                    if (typeof m.text === 'string' && m.text.toLowerCase().includes(`template: ${tplKey}`)) return true;
                    return false;
                });

                const totalSent = matched.length;
                const totalRead = matched.filter(m => m.status === 'READ').length;
                const totalFailed = matched.filter(m => m.status === 'FAILED').length;

                return {
                    id: t.id,
                    name: t.name,
                    category: t.category || 'MARKETING',
                    language: t.language || 'en_US',
                    type: t.type || 'TEXT',
                    status: t.status || 'APPROVED',
                    sentCount: totalSent,
                    readCount: totalRead,
                    failedCount: totalFailed,
                    deliveryRate: totalSent > 0 ? `${(((totalSent - totalFailed) / totalSent) * 100).toFixed(1)}%` : "100.0%",
                    createdAt: new Date(t.createdAt).toISOString()
                };
            });

            return {
                data: {
                    success: true,
                    reportType: 'templates',
                    pagination: {
                        totalCount,
                        totalPages: Math.ceil(totalCount / pageSize),
                        currentPage: page,
                        pageSize
                    },
                    rows
                }
            };
        }

        // ==========================================
        // 4. AUDIENCE CONTACTS REPORT
        // ==========================================
        if (reportType === 'contacts') {
            const whereClause = {
                OR: [{ workspaceId }, { userId: { in: workspaceUserIds } }]
            };

            if (search && search.trim() !== '') {
                whereClause.OR = [
                    { name: { contains: search.trim(), mode: 'insensitive' } },
                    { phone: { contains: search.trim(), mode: 'insensitive' } },
                    { email: { contains: search.trim(), mode: 'insensitive' } }
                ];
            }

            const [totalCount, contacts, messages] = await Promise.all([
                db.contact.count({ where: whereClause }),
                db.contact.findMany({
                    where: whereClause,
                    orderBy: { createdAt: 'desc' },
                    skip: (page - 1) * pageSize,
                    take: pageSize
                }),
                db.whatsAppMessage.findMany({
                    where: { userId: { in: workspaceUserIds } },
                    select: { jid: true, createdAt: true, fromMe: true }
                })
            ]);

            const rows = contacts.map(c => {
                const clean = (c.phone || '').replace(/\D/g, '');
                const last10 = clean.slice(-10);

                const contactMsgs = messages.filter(m => {
                    const mClean = (m.jid || '').replace(/\D/g, '');
                    return mClean.endsWith(last10);
                });

                const totalInteractions = contactMsgs.length;
                const inboundReplies = contactMsgs.filter(m => !m.fromMe).length;
                const lastInteraction = contactMsgs.length > 0
                    ? new Date(Math.max(...contactMsgs.map(m => new Date(m.createdAt).getTime()))).toISOString()
                    : null;

                return {
                    id: c.id,
                    name: c.name || 'Unnamed Contact',
                    phone: c.phone,
                    email: c.email || 'N/A',
                    totalInteractions,
                    inboundReplies,
                    lastInteraction,
                    createdAt: new Date(c.createdAt).toISOString()
                };
            });

            return {
                data: {
                    success: true,
                    reportType: 'contacts',
                    pagination: {
                        totalCount,
                        totalPages: Math.ceil(totalCount / pageSize),
                        currentPage: page,
                        pageSize
                    },
                    rows
                }
            };
        }

        return { error: "Invalid report type" };

    } catch (error) {
        console.error("[GET_KONNECTX_REPORTS_ERROR]", error);
        return { error: error.message || "Failed to fetch reports" };
    }
};

export const getReports = createSafeAction(GetReportsSchema, handler);
