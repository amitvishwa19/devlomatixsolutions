import { prisma } from '@/lib/prisma';
import { validateCrmUserToken } from '../../_lib/auth';
import { apiSuccess, apiError } from '../../_lib/response';
import { getUserAuthorizedMailboxes } from '../_lib/org-mailboxes';

/**
 * Validates if the authenticated user has access to view or mutate a thread.
 */
async function authorizeThreadAccess(thread, user, workspaceId) {
    if (!thread) return false;

    const { authorizedEmails, isAdmin } = await getUserAuthorizedMailboxes(user.id, workspaceId);
    if (isAdmin) return true;

    const threadEmails = (thread.messages || []).flatMap((m) => [
        m.fromEmail,
        ...(Array.isArray(m.to) ? m.to : []),
        ...(Array.isArray(m.cc) ? m.cc : []),
        ...(Array.isArray(m.bcc) ? m.bcc : [])
    ]).map((e) => (typeof e === 'string' ? e.trim().toLowerCase() : '')).filter(Boolean);

    return authorizedEmails.some((ae) => threadEmails.includes(ae.toLowerCase()));
}

/**
 * GET /api/v5/crm/mailbox/[id]
 * 
 * Fetches full thread details with all messages, attachments, linked contact, and deal.
 * Automatically marks thread as read.
 */
export async function GET(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) {
            return apiError(auth.error, auth.status);
        }

        const { id } = await params;

        const thread = await prisma.crmEmailThread.findUnique({
            where: { id },
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
            return apiError('Thread not found', 404);
        }

        const isAuthorized = await authorizeThreadAccess(thread, auth.user, auth.workspaceId);
        if (!isAuthorized) {
            return apiError('Unauthorized to view this email thread', 403);
        }

        // Auto-mark thread and messages as read
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

        return apiSuccess(thread);
    } catch (error) {
        console.error('[CRM_MAILBOX_THREAD_GET_ERROR]', error);
        return apiError(error.message, 500);
    }
}

/**
 * PATCH /api/v5/crm/mailbox/[id]
 * 
 * Update thread properties (folder, isStarred, contactId, dealId, assignedToId)
 */
export async function PATCH(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) {
            return apiError(auth.error, auth.status);
        }

        const { id } = await params;
        const body = await request.json();
        const { folder, isStarred, contactId, dealId, assignedToId, subject } = body;

        const existing = await prisma.crmEmailThread.findUnique({
            where: { id },
            include: { messages: { select: { fromEmail: true, to: true, cc: true, bcc: true } } }
        });

        if (!existing) {
            return apiError('Thread not found', 404);
        }

        const isAuthorized = await authorizeThreadAccess(existing, auth.user, auth.workspaceId);
        if (!isAuthorized) {
            return apiError('Unauthorized to update this email thread', 403);
        }

        const data = {};
        if (folder !== undefined) {
            data.folder = folder;
            data.isArchived = folder === 'ARCHIVE';
        }
        if (isStarred !== undefined) data.isStarred = Boolean(isStarred);
        if (contactId !== undefined) data.contactId = contactId || null;
        if (dealId !== undefined) data.dealId = dealId || null;
        if (assignedToId !== undefined) data.assignedToId = assignedToId || null;
        if (subject !== undefined) data.subject = subject;

        const updated = await prisma.crmEmailThread.update({
            where: { id },
            data,
            include: {
                contact: true,
                deal: true
            }
        });

        return apiSuccess(updated);
    } catch (error) {
        console.error('[CRM_MAILBOX_THREAD_PATCH_ERROR]', error);
        return apiError(error.message, 500);
    }
}

/**
 * DELETE /api/v5/crm/mailbox/[id]
 * 
 * Soft delete: moves to TRASH.
 * If already in TRASH: permanently deletes.
 */
export async function DELETE(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) {
            return apiError(auth.error, auth.status);
        }

        const { id } = await params;

        const thread = await prisma.crmEmailThread.findUnique({
            where: { id },
            include: { messages: { select: { fromEmail: true, to: true, cc: true, bcc: true } } }
        });

        if (!thread) {
            return apiError('Thread not found', 404);
        }

        const isAuthorized = await authorizeThreadAccess(thread, auth.user, auth.workspaceId);
        if (!isAuthorized) {
            return apiError('Unauthorized to delete this email thread', 403);
        }

        if (thread.folder === 'TRASH') {
            // Permanent delete (cascade deletes messages and attachments)
            await prisma.crmEmailThread.delete({
                where: { id: thread.id }
            });
            return apiSuccess({ deleted: true, permanent: true });
        } else {
            // Move to TRASH
            await prisma.crmEmailThread.update({
                where: { id: thread.id },
                data: { folder: 'TRASH' }
            });
            return apiSuccess({ deleted: true, permanent: false, folder: 'TRASH' });
        }
    } catch (error) {
        console.error('[CRM_MAILBOX_THREAD_DELETE_ERROR]', error);
        return apiError(error.message, 500);
    }
}
