'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getValidUserId } from '../../_actions/auth-helper';
import { Resend } from 'resend';
import { emitKonnectxEvent } from '@/lib/socket-bridge';
import { resolveUserSender } from '@/app/api/v5/crm/mailbox/_lib/threading';

async function getResendClient(workspaceId) {
    let apiKey = process.env.RESEND_API_KEY;
    let fromEmail = process.env.RESEND_FROM_EMAIL || 'crm@devlomatix.in';

    if (workspaceId) {
        const cred = await prisma.credentials.findFirst({
            where: {
                workspaceId,
                platform: 'RESEND'
            }
        });
        if (cred?.key) {
            apiKey = cred.key;
            if (cred.info?.fromEmail) fromEmail = cred.info.fromEmail;
        }
    }

    if (!apiKey) {
        throw new Error('Resend API key is not configured. Please add RESEND_API_KEY to your environment variables.');
    }

    return {
        resend: new Resend(apiKey),
        defaultFromEmail: fromEmail
    };
}

/**
 * Get paginated mailbox threads with counts
 */
export async function getMailboxThreadsAction(workspaceId, {
    folder = 'INBOX',
    search = '',
    contactId = null,
    dealId = null,
    isStarred = false,
    page = 1,
    limit = 30
} = {}) {
    try {
        const skip = (page - 1) * limit;
        const baseWhere = { workspaceId };

        const folderFilter = folder === 'INBOX'
            ? {
                folder: 'INBOX',
                messages: { some: { direction: 'INBOUND' } }
            }
            : folder === 'SENT'
                ? {
                    folder: { not: 'TRASH' },
                    OR: [
                        { folder: 'SENT' },
                        { messages: { some: { direction: 'OUTBOUND' } } }
                    ]
                }
                : folder === 'STARRED'
                    ? { isStarred: true, folder: { not: 'TRASH' } }
                    : folder === 'ALL'
                        ? { folder: { not: 'TRASH' } }
                        : { folder };

        const where = {
            ...baseWhere,
            ...folderFilter,
            ...(isStarred ? { isStarred: true } : {}),
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
            prisma.crmEmailThread.count({ where: { ...baseWhere, folder: 'INBOX', messages: { some: { direction: 'INBOUND' } } } }),
            prisma.crmEmailThread.count({ where: { ...baseWhere, isStarred: true, folder: { not: 'TRASH' } } }),
            prisma.crmEmailThread.count({
                where: {
                    ...baseWhere,
                    folder: { not: 'TRASH' },
                    OR: [
                        { folder: 'SENT' },
                        { messages: { some: { direction: 'OUTBOUND' } } }
                    ]
                }
            }),
            prisma.crmEmailThread.count({ where: { ...baseWhere, folder: 'ARCHIVE' } }),
            prisma.crmEmailThread.count({ where: { ...baseWhere, folder: 'TRASH' } })
        ]);

        return {
            success: true,
            data: threads,
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
            }
        };
    } catch (error) {
        console.error('[GET_MAILBOX_THREADS_ERROR]', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get full thread detail with all messages and mark as read
 */
export async function getMailboxThreadDetailAction(workspaceId, threadId) {
    try {
        const thread = await prisma.crmEmailThread.findFirst({
            where: { id: threadId, workspaceId },
            include: {
                contact: {
                    include: {
                        deals: {
                            select: { id: true, title: true, value: true, stage: true }
                        }
                    }
                },
                deal: {
                    include: {
                        stage: true,
                        pipeline: true
                    }
                },
                assignedTo: {
                    select: { id: true, displayName: true, email: true, avatar: true }
                },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        attachments: true,
                        sentByUser: {
                            select: { id: true, displayName: true, email: true, avatar: true }
                        }
                    }
                }
            }
        });

        if (!thread) {
            return { success: false, error: 'Thread not found' };
        }

        if (thread.unreadCount > 0) {
            await Promise.all([
                prisma.crmEmailThread.update({
                    where: { id: thread.id },
                    data: { unreadCount: 0 }
                }),
                prisma.crmEmailMessage.updateMany({
                    where: { threadId: thread.id, isRead: false },
                    data: { isRead: true }
                })
            ]);
            thread.unreadCount = 0;
        }

        return { success: true, data: thread };
    } catch (error) {
        console.error('[GET_MAILBOX_THREAD_DETAIL_ERROR]', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send outbound email via Resend and link to thread/contact/deal
 */
export async function sendMailboxEmailAction(workspaceId, {
    threadId = null,
    contactId = null,
    dealId = null,
    senderName = null,
    to = [],
    cc = [],
    bcc = [],
    subject,
    bodyHtml,
    bodyText,
    attachments = []
}) {
    try {
        const userId = await getValidUserId(workspaceId);
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, displayName: true, username: true, email: true }
        });

        const toList = Array.isArray(to) ? to : [to];
        if (toList.length === 0) throw new Error('Recipient email is required');
        if (!subject) throw new Error('Subject is required');

        const { resend, defaultFromEmail } = await getResendClient(workspaceId);
        const { formattedFrom, pureEmail, replyTo, fallbackFrom, fallbackEmail, userName } = resolveUserSender(user, defaultFromEmail, senderName);

        // Auto-heal displayName in DB if it was null or had dots
        if (user && (!user.displayName || user.displayName.includes('.'))) {
            await prisma.user.update({
                where: { id: user.id },
                data: { displayName: userName }
            }).catch(() => {});
        }

        let existingThread = null;
        let inReplyTo = null;
        let references = null;

        if (threadId) {
            existingThread = await prisma.crmEmailThread.findFirst({
                where: { id: threadId, workspaceId },
                include: {
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    }
                }
            });

            if (existingThread?.messages?.length > 0) {
                const lastMsg = existingThread.messages[0];
                if (lastMsg?.messageId) {
                    inReplyTo = lastMsg.messageId;
                    const prevRefs = existingThread.messages
                        .map(m => m.messageId)
                        .filter(Boolean);
                    references = [...new Set(prevRefs)].join(' ');
                }
            }
        }

        const domain = pureEmail.split('@')[1] || 'devlomatix.com';
        const generatedMessageId = `<crm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@${domain}>`;

        const customHeaders = {
            'Message-ID': generatedMessageId,
            ...(inReplyTo ? { 'In-Reply-To': inReplyTo } : {}),
            ...(references ? { 'References': references } : {})
        };

        const emailPayload = {
            from: formattedFrom,
            to: toList,
            cc: cc.length > 0 ? cc : undefined,
            bcc: bcc.length > 0 ? bcc : undefined,
            reply_to: replyTo || user?.email || undefined,
            subject,
            html: bodyHtml || `<pre>${bodyText}</pre>`,
            text: bodyText || (bodyHtml ? bodyHtml.replace(/<[^>]+>/g, '') : ''),
            headers: customHeaders
        };

        if (attachments.length > 0) {
            emailPayload.attachments = attachments.map(att => ({
                filename: att.filename,
                content: att.content,
                path: att.url || undefined
            }));
        }

        let resendData = null;
        let resendError = null;

        const primaryResult = await resend.emails.send(emailPayload);
        resendData = primaryResult.data;
        resendError = primaryResult.error;

        // If primary attempt fails due to unverified user domain, fallback to verified domain with reply_to set to user's email
        if (resendError && (resendError.message?.toLowerCase().includes('not verified') || resendError.name === 'validation_error' || resendError.message?.toLowerCase().includes('domain'))) {
            console.warn(`[RESEND_DOMAIN_RETRY] Sending as ${formattedFrom} failed verification. Retrying via verified domain ${fallbackEmail} with reply_to.`);
            emailPayload.from = fallbackFrom;
            emailPayload.reply_to = pureEmail || fallbackEmail;
            const retryResult = await resend.emails.send(emailPayload);
            resendData = retryResult.data;
            resendError = retryResult.error;
        }

        if (resendError) {
            throw new Error(`Resend error: ${resendError.message}`);
        }

        const resendEmailId = resendData?.id || null;
        const snippet = (bodyText || bodyHtml.replace(/<[^>]+>/g, '') || '').slice(0, 160).trim();

        let thread = existingThread;
        if (!thread) {
            thread = await prisma.crmEmailThread.create({
                data: {
                    workspaceId,
                    subject,
                    snippet,
                    lastMessageAt: new Date(),
                    contactId: contactId || null,
                    dealId: dealId || null,
                    folder: 'SENT',
                    unreadCount: 0
                }
            });
        } else {
            await prisma.crmEmailThread.update({
                where: { id: thread.id },
                data: {
                    lastMessageAt: new Date(),
                    snippet,
                    ...(contactId && !thread.contactId ? { contactId } : {}),
                    ...(dealId && !thread.dealId ? { dealId } : {})
                }
            });
        }

        const message = await prisma.crmEmailMessage.create({
            data: {
                threadId: thread.id,
                workspaceId,
                messageId: generatedMessageId,
                inReplyTo,
                references,
                resendEmailId,
                direction: 'OUTBOUND',
                status: 'SENT',
                from: emailPayload.from,
                fromEmail: pureEmail,
                to: toList,
                cc,
                bcc,
                subject,
                bodyText,
                bodyHtml,
                snippet,
                headers: customHeaders,
                isRead: true,
                sentByUserId: user.id
            }
        });

        // Log CrmActivity
        await prisma.crmActivity.create({
            data: {
                workspaceId,
                userId: user.id,
                type: 'EMAIL',
                title: `Email sent: ${subject.slice(0, 80)}`,
                description: snippet || 'Outbound email sent via CRM Mailbox',
                contactId: thread.contactId || contactId || null,
                dealId: thread.dealId || dealId || null,
                metadata: {
                    threadId: thread.id,
                    messageId: message.id,
                    resendEmailId,
                    to: toList
                }
            }
        }).catch(() => {});

        // Emit Socket event
        try {
            await emitKonnectxEvent(workspaceId, 'crm:mailbox:email_sent', {
                workspaceId,
                threadId: thread.id,
                messageId: message.id,
                resendEmailId,
                subject,
                to: toList,
                sentBy: user.displayName
            });
        } catch (e) {}

        const fullThread = await prisma.crmEmailThread.findUnique({
            where: { id: thread.id },
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
            }
        });

        revalidatePath(`/workspace/${workspaceId}/crm/mailbox`);

        return {
            success: true,
            data: {
                threadId: thread.id,
                messageId: message.id,
                resendEmailId,
                thread: fullThread,
                message
            }
        };
    } catch (error) {
        console.error('[SEND_MAILBOX_EMAIL_ERROR]', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update thread actions (star, folder, link deal/contact)
 */
export async function updateMailboxThreadAction(workspaceId, {
    threadId,
    threadIds = [],
    action,
    folder,
    dealId,
    contactId
}) {
    try {
        const targetIds = threadIds.length > 0 ? threadIds : (threadId ? [threadId] : []);
        if (targetIds.length === 0) throw new Error('No thread specified');

        const where = {
            id: { in: targetIds },
            workspaceId
        };

        if (action === 'toggleStar') {
            const current = await prisma.crmEmailThread.findFirst({
                where: { id: targetIds[0], workspaceId }
            });
            if (current) {
                const updated = await prisma.crmEmailThread.update({
                    where: { id: current.id },
                    data: { isStarred: !current.isStarred }
                });
                return { success: true, isStarred: updated.isStarred };
            }
        }

        if (action === 'setFolder') {
            await prisma.crmEmailThread.updateMany({
                where,
                data: {
                    folder,
                    isArchived: folder === 'ARCHIVE'
                }
            });
            return { success: true, folder };
        }

        if (action === 'markRead') {
            await Promise.all([
                prisma.crmEmailThread.updateMany({ where, data: { unreadCount: 0 } }),
                prisma.crmEmailMessage.updateMany({
                    where: { threadId: { in: targetIds }, workspaceId },
                    data: { isRead: true }
                })
            ]);
            return { success: true };
        }

        if (action === 'markUnread') {
            await prisma.crmEmailThread.updateMany({ where, data: { unreadCount: 1 } });
            return { success: true };
        }

        if (action === 'linkDeal') {
            await prisma.crmEmailThread.updateMany({ where, data: { dealId: dealId || null } });
            return { success: true, dealId };
        }

        if (action === 'linkContact') {
            await prisma.crmEmailThread.updateMany({ where, data: { contactId: contactId || null } });
            return { success: true, contactId };
        }

        revalidatePath(`/workspace/${workspaceId}/crm/mailbox`);
        return { success: false, error: 'Unknown action' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Autocomplete helper for CRM contacts and deals
 */
export async function getMailboxContactsAndDealsAction(workspaceId) {
    try {
        const userId = await getValidUserId(workspaceId);
        const [user, { defaultFromEmail }, contacts, deals] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, displayName: true, username: true, email: true }
            }),
            getResendClient(workspaceId).catch(() => ({ defaultFromEmail: process.env.RESEND_FROM_EMAIL || 'crm@devlomatix.in' })),
            prisma.contact.findMany({
                where: { workspaceId },
                select: { id: true, name: true, email: true, phone: true, type: true },
                orderBy: { name: 'asc' },
                take: 100
            }),
            prisma.deal.findMany({
                where: { workspaceId },
                select: { id: true, title: true, value: true, currency: true, stage: true },
                orderBy: { updatedAt: 'desc' },
                take: 50
            })
        ]);

        const senderInfo = resolveUserSender(user, defaultFromEmail);

        return {
            success: true,
            data: {
                contacts,
                deals,
                senderInfo: {
                    formattedFrom: senderInfo.formattedFrom,
                    name: senderInfo.userName,
                    email: senderInfo.pureEmail
                }
            }
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
