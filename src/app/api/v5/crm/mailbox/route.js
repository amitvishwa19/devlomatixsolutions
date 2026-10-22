import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { validateCrmUserToken } from '../_lib/auth';
import { apiSuccess, apiError } from '../_lib/response';
import { verifyResendWebhookSignature } from './_lib/webhook-verify';
import {
    parseEmailAddress,
    normalizeSubject,
    resolveWorkspaceForInboundEmail,
    findOrCreateContact,
    findActiveDealForContact,
    findOrCreateEmailThread
} from './_lib/threading';
import { emitKonnectxEvent } from '@/lib/socket-bridge';
import { getUserAuthorizedMailboxes } from './_lib/org-mailboxes';

/**
 * POST /api/v5/crm/mailbox
 * 
 * Dual-Mode Endpoint:
 * 1. Resend Inbound Webhook (`email.received`, `email.delivered`, `email.bounced`)
 * 2. Authenticated Outbound/Draft Creation fallback
 */
export async function POST(request) {
    try {
        const rawBody = await request.text();
        const svixSignature = request.headers.get('svix-signature');
        const svixId = request.headers.get('svix-id');

        let payload = null;
        try {
            payload = JSON.parse(rawBody);
        } catch (e) {
            return apiError('Invalid JSON payload', 400);
        }

        // ==========================================
        // 1. INBOUND WEBHOOK FROM RESEND
        // ==========================================
        const isWebhook = svixSignature || svixId || (payload?.type && payload?.type.startsWith('email.'));

        if (isWebhook) {
            // Verify signature
            const verification = verifyResendWebhookSignature({
                rawBody,
                headers: request.headers
            });

            if (!verification.isValid && process.env.NODE_ENV === 'production') {
                console.error('[RESEND_WEBHOOK_REJECTED]', verification.reason);
                return apiError(`Unauthorized webhook: ${verification.reason}`, 401);
            }

            const eventType = payload.type;
            const data = payload.data || {};

            // Handle Inbound Email Receipt
            if (eventType === 'email.received') {
                const resendEmailId = data.email_id || data.id || null;
                const rawFrom = data.from || '';
                const { name: fromName, email: fromEmail } = parseEmailAddress(rawFrom);
                const toList = Array.isArray(data.to) ? data.to : (data.to ? [data.to] : []);
                const ccList = Array.isArray(data.cc) ? data.cc : (data.cc ? [data.cc] : []);
                const bccList = Array.isArray(data.bcc) ? data.bcc : (data.bcc ? [data.bcc] : []);
                let subject = data.subject || '(No Subject)';
                let bodyText = data.text || '';
                let bodyHtml = data.html || '';
                const rawHeaders = data.headers || {};
                let messageId = data.message_id || rawHeaders['message-id'] || null;
                let inReplyTo = rawHeaders['in-reply-to'] || null;
                let references = rawHeaders['references'] || null;
                let attachments = Array.isArray(data.attachments) ? data.attachments : [];

                // Resend inbound webhook payloads only provide metadata by default.
                // Fetch the full content & attachments via Resend Receiving API if body is empty:
                if ((!bodyText && !bodyHtml) && resendEmailId && process.env.RESEND_API_KEY) {
                    try {
                        const resendClient = new Resend(process.env.RESEND_API_KEY);
                        if (resendClient.emails?.receiving?.get) {
                            const receivingRes = await resendClient.emails.receiving.get(resendEmailId);
                            if (receivingRes?.data) {
                                bodyText = receivingRes.data.text || bodyText;
                                bodyHtml = receivingRes.data.html || bodyHtml;
                                if (receivingRes.data.subject) subject = receivingRes.data.subject;
                                if (Array.isArray(receivingRes.data.attachments) && receivingRes.data.attachments.length > 0) {
                                    attachments = receivingRes.data.attachments;
                                }
                            }
                        }
                    } catch (fetchErr) {
                        console.warn('[RESEND_INBOUND_BODY_FETCH_WARNING]', fetchErr.message);
                    }
                }

                if (!bodyHtml && bodyText) {
                    bodyHtml = `<pre>${bodyText}</pre>`;
                }

                // Step 1: Resolve Workspace
                const workspaceId = await resolveWorkspaceForInboundEmail({
                    to: toList,
                    fromEmail
                });

                // Step 2: Find or Auto-Create Contact
                const contact = await findOrCreateContact({
                    workspaceId,
                    fromEmail,
                    fromName
                });

                // Step 3: Find Active Deal for Contact
                const deal = contact ? await findActiveDealForContact(contact.id, workspaceId) : null;

                // Step 4: Find or Create Thread
                const snippet = (bodyText || bodyHtml.replace(/<[^>]+>/g, '') || '').slice(0, 160).trim();
                const { thread, isNew } = await findOrCreateEmailThread({
                    workspaceId,
                    subject,
                    inReplyTo,
                    references,
                    contactId: contact?.id || null,
                    dealId: deal?.id || null,
                    snippet
                });

                // Step 5: Save Inbound Email Message
                const message = await prisma.crmEmailMessage.create({
                    data: {
                        threadId: thread.id,
                        workspaceId,
                        messageId,
                        inReplyTo,
                        references,
                        resendEmailId,
                        direction: 'INBOUND',
                        status: 'RECEIVED',
                        from: rawFrom,
                        fromEmail,
                        to: toList,
                        cc: ccList,
                        bcc: bccList,
                        replyTo: data.reply_to?.[0] || null,
                        subject,
                        bodyText,
                        bodyHtml,
                        snippet,
                        headers: rawHeaders,
                        isRead: false
                    }
                });

                // Step 6: Process Attachments
                if (attachments.length > 0) {
                    await prisma.crmEmailAttachment.createMany({
                        data: attachments.map(att => ({
                            messageId: message.id,
                            filename: att.filename || 'attachment',
                            contentType: att.content_type || 'application/octet-stream',
                            size: att.size || 0,
                            url: att.url || att.download_url || '',
                            contentId: att.content_id || null
                        }))
                    });
                }

                // Step 7: Update Thread State
                await prisma.crmEmailThread.update({
                    where: { id: thread.id },
                    data: {
                        lastMessageAt: new Date(),
                        snippet,
                        folder: 'INBOX',
                        isArchived: false,
                        unreadCount: { increment: 1 },
                        ...(contact?.id && !thread.contactId ? { contactId: contact.id } : {}),
                        ...(deal?.id && !thread.dealId ? { dealId: deal.id } : {})
                    }
                });

                // Step 8: Log Unified CRM Activity
                const adminUser = await prisma.user.findFirst({ select: { id: true } });
                if (adminUser?.id) {
                    await prisma.crmActivity.create({
                        data: {
                            workspaceId,
                            userId: adminUser.id,
                            type: 'EMAIL',
                            title: `Email received: ${subject.slice(0, 80)}`,
                            description: snippet || 'Inbound email received via Resend',
                            contactId: contact?.id || null,
                            dealId: deal?.id || null,
                            metadata: {
                                threadId: thread.id,
                                messageId: message.id,
                                from: rawFrom,
                                to: toList
                            }
                        }
                    }).catch(err => console.warn('[CRM_ACTIVITY_LOG_WARN]', err.message));
                }

                // Step 9: Broadcast Real-Time Socket Event
                try {
                    await emitKonnectxEvent(workspaceId, 'crm:mailbox:new_email', {
                        workspaceId,
                        threadId: thread.id,
                        messageId: message.id,
                        subject,
                        from: rawFrom,
                        fromEmail,
                        snippet,
                        contactName: contact?.name || fromName,
                        isNewThread: isNew,
                        createdAt: new Date().toISOString()
                    });
                } catch (socketErr) {
                    console.warn('[SOCKET_BRIDGE_WARN]', socketErr.message);
                }

                console.log(`[RESEND_INBOUND_SAVED] Message ${message.id} saved to thread ${thread.id} in workspace ${workspaceId}`);
                return apiSuccess({
                    processed: true,
                    event: 'email.received',
                    threadId: thread.id,
                    messageId: message.id
                });
            }

            // Delivery Status / Engagement Webhook Updates
            if (['email.delivered', 'email.bounced', 'email.opened', 'email.clicked'].includes(eventType)) {
                const resendEmailId = data.email_id || data.id;
                if (resendEmailId) {
                    const statusMap = {
                        'email.delivered': 'DELIVERED',
                        'email.bounced': 'BOUNCED'
                    };
                    const newStatus = statusMap[eventType];
                    if (newStatus) {
                        await prisma.crmEmailMessage.updateMany({
                            where: { resendEmailId },
                            data: { status: newStatus }
                        });
                    }
                }
                return apiSuccess({ processed: true, event: eventType });
            }

            return apiSuccess({ processed: true, note: `Ignored event ${eventType}` });
        }

        // ==========================================
        // 2. AUTHENTICATED CRM USER DISPATCH FALLBACK
        // ==========================================
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) {
            return apiError('Unauthorized: Webhook signature or valid usertoken required', 401);
        }

        return apiError('For sending emails, please use POST /api/v5/crm/mailbox/send', 400);
    } catch (error) {
        console.error('[CRM_MAILBOX_POST_ERROR]', error);
        return apiError(error.message, 500);
    }
}

/**
 * GET /api/v5/crm/mailbox
 * 
 * Lists threads with filters (folder, search, contactId, dealId, unreadOnly) and counts.
 */
export async function GET(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) {
            return apiError(auth.error, auth.status);
        }

        const { searchParams } = new URL(request.url);
        const folder = searchParams.get('folder') || 'INBOX';
        const search = searchParams.get('search')?.trim();
        const mailboxEmailParam = searchParams.get('mailboxEmail') || 'ALL';
        const contactId = searchParams.get('contactId');
        const dealId = searchParams.get('dealId');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';
        const isStarred = searchParams.get('isStarred') === 'true';

        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '30', 10);
        const skip = (page - 1) * limit;

        // Resolve user's authorized mailbox identities
        const { mailboxes, authorizedEmails, isAdmin } = await getUserAuthorizedMailboxes(auth.user.id, auth.workspaceId);
        const cleanMailbox = (mailboxEmailParam && mailboxEmailParam !== 'ALL') ? mailboxEmailParam.trim().toLowerCase() : null;

        let baseWhere;

        if (cleanMailbox) {
            // Filter strictly by the requested email ID across to, cc, bcc, and fromEmail
            baseWhere = {
                messages: {
                    some: {
                        OR: [
                            { to: { has: cleanMailbox } },
                            { cc: { has: cleanMailbox } },
                            { bcc: { has: cleanMailbox } },
                            { fromEmail: { equals: cleanMailbox, mode: 'insensitive' } }
                        ]
                    }
                }
            };
        } else {
            // 'ALL' mailbox selected: filter by all authorized email IDs for this user
            const allEmails = authorizedEmails.map(e => e.toLowerCase()).filter(Boolean);
            baseWhere = isAdmin
                ? {}
                : allEmails.length > 0
                    ? {
                        messages: {
                            some: {
                                OR: [
                                    { to: { hasSome: allEmails } },
                                    { cc: { hasSome: allEmails } },
                                    { bcc: { hasSome: allEmails } },
                                    { fromEmail: { in: allEmails } }
                                ]
                            }
                        }
                    }
                    : { id: '__no_access__' };
        }

        const folderFilter = folder === 'INBOX'
            ? { folder: 'INBOX' }
            : folder === 'SENT'
                ? { folder: 'SENT' }
                : folder === 'STARRED'
                    ? { isStarred: true, folder: { not: 'TRASH' } }
                    : folder === 'ALL'
                        ? { folder: { not: 'TRASH' } }
                        : { folder };

        const where = {
            ...baseWhere,
            ...folderFilter,
            ...(isStarred ? { isStarred: true } : {}),
            ...(unreadOnly ? { unreadCount: { gt: 0 } } : {}),
            ...(contactId ? { contactId } : {}),
            ...(dealId ? { dealId } : {}),
            ...(search ? {
                OR: [
                    { subject: { contains: search, mode: 'insensitive' } },
                    { snippet: { contains: search, mode: 'insensitive' } },
                    { contact: { name: { contains: search, mode: 'insensitive' } } },
                    { contact: { email: { contains: search, mode: 'insensitive' } } }
                ]
            } : {})
        };

        const [threads, total, unreadCount, inboxCount, starredCount, sentCount, archiveCount, trashCount] = await Promise.all([
            prisma.crmEmailThread.findMany({
                where,
                include: {
                    contact: {
                        select: { id: true, name: true, email: true, phone: true, type: true }
                    },
                    deal: {
                        select: { id: true, title: true, value: true, currency: true, stage: true }
                    },
                    assignedTo: {
                        select: { id: true, displayName: true, email: true, avatar: true }
                    },
                    messages: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                        select: {
                            id: true,
                            from: true,
                            fromEmail: true,
                            to: true,
                            direction: true,
                            status: true,
                            createdAt: true,
                            isRead: true
                        }
                    },
                    _count: {
                        select: { messages: true }
                    }
                },
                orderBy: { lastMessageAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.crmEmailThread.count({ where }),
            prisma.crmEmailThread.count({ where: { ...baseWhere, folder: 'INBOX', unreadCount: { gt: 0 } } }),
            prisma.crmEmailThread.count({ where: { ...baseWhere, folder: 'INBOX' } }),
            prisma.crmEmailThread.count({ where: { ...baseWhere, isStarred: true, folder: { not: 'TRASH' } } }),
            prisma.crmEmailThread.count({ where: { ...baseWhere, folder: 'SENT' } }),
            prisma.crmEmailThread.count({ where: { ...baseWhere, folder: 'ARCHIVE' } }),
            prisma.crmEmailThread.count({ where: { ...baseWhere, folder: 'TRASH' } })
        ]);

        return apiSuccess(threads, {
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            counts: {
                unread: unreadCount,
                inbox: inboxCount,
                starred: starredCount,
                sent: sentCount,
                archive: archiveCount,
                trash: trashCount
            },
            mailboxes: mailboxes || []
        });
    } catch (error) {
        console.error('[CRM_MAILBOX_GET_ERROR]', error);
        return apiError(error.message, 500);
    }
}

/**
 * PATCH /api/v5/crm/mailbox
 * 
 * Bulk or single thread action: markRead, markUnread, toggleStar, setFolder, linkDeal, linkContact
 */
export async function PATCH(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) {
            return apiError(auth.error, auth.status);
        }

        const body = await request.json();
        const { threadIds, threadId, action, folder, dealId, contactId } = body;
        const targetIds = Array.isArray(threadIds) ? threadIds : (threadId ? [threadId] : []);

        if (targetIds.length === 0) {
            return apiError('Missing threadIds or threadId', 400);
        }

        const { authorizedEmails, isAdmin } = await getUserAuthorizedMailboxes(auth.user.id, auth.workspaceId);
        const allEmails = authorizedEmails.map(e => e.toLowerCase()).filter(Boolean);
        const where = isAdmin
            ? { id: { in: targetIds } }
            : {
                id: { in: targetIds },
                messages: {
                    some: {
                        OR: [
                            { to: { hasSome: allEmails } },
                            { cc: { hasSome: allEmails } },
                            { bcc: { hasSome: allEmails } },
                            { fromEmail: { in: allEmails } }
                        ]
                    }
                }
            };

        if (action === 'markRead') {
            await prisma.crmEmailThread.updateMany({
                where,
                data: { unreadCount: 0 }
            });
            await prisma.crmEmailMessage.updateMany({
                where: { threadId: { in: targetIds } },
                data: { isRead: true }
            });
            return apiSuccess({ updated: true, action: 'markRead', count: targetIds.length });
        }

        if (action === 'markUnread') {
            await prisma.crmEmailThread.updateMany({
                where,
                data: { unreadCount: 1 }
            });
            return apiSuccess({ updated: true, action: 'markUnread', count: targetIds.length });
        }

        if (action === 'toggleStar') {
            const thread = await prisma.crmEmailThread.findFirst({
                where: { id: targetIds[0] }
            });
            if (thread) {
                const updated = await prisma.crmEmailThread.update({
                    where: { id: thread.id },
                    data: { isStarred: !thread.isStarred }
                });
                return apiSuccess({ updated: true, isStarred: updated.isStarred });
            }
        }

        if (action === 'setFolder') {
            const validFolders = ['INBOX', 'SENT', 'ARCHIVE', 'TRASH', 'SPAM'];
            if (!validFolders.includes(folder)) {
                return apiError(`Invalid folder. Must be one of: ${validFolders.join(', ')}`, 400);
            }
            await prisma.crmEmailThread.updateMany({
                where,
                data: {
                    folder,
                    isArchived: folder === 'ARCHIVE'
                }
            });
            return apiSuccess({ updated: true, folder, count: targetIds.length });
        }

        if (action === 'linkDeal') {
            await prisma.crmEmailThread.updateMany({
                where,
                data: { dealId: dealId || null }
            });
            return apiSuccess({ updated: true, dealId });
        }

        if (action === 'linkContact') {
            await prisma.crmEmailThread.updateMany({
                where,
                data: { contactId: contactId || null }
            });
            return apiSuccess({ updated: true, contactId });
        }

        return apiError('Invalid action specified', 400);
    } catch (error) {
        console.error('[CRM_MAILBOX_PATCH_ERROR]', error);
        return apiError(error.message, 500);
    }
}
