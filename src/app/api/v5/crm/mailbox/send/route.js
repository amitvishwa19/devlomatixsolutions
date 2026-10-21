import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { validateCrmUserToken } from '../../_lib/auth';
import { apiSuccess, apiError } from '../../_lib/response';
import { normalizeSubject, resolveUserSender } from '../_lib/threading';
import { isUserAuthorizedForMailbox } from '../_lib/org-mailboxes';
import { emitKonnectxEvent } from '@/lib/socket-bridge';

/**
 * Resolves Resend client and default from address for the workspace.
 */
async function getResendClient(workspaceId) {
    // Check if workspace has dedicated Resend credentials configured
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
        throw new Error('Resend API key is not configured. Please set RESEND_API_KEY in environment or workspace credentials.');
    }

    return {
        resend: new Resend(apiKey),
        defaultFromEmail: fromEmail
    };
}



/**
 * POST /api/v5/crm/mailbox/send
 * 
 * Dispatches an outbound email via Resend and links to thread, contact, and deal.
 */
export async function POST(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) {
            return apiError(auth.error, auth.status);
        }

        const body = await request.json();
        const {
            threadId,
            contactId,
            dealId,
            senderName,
            fromEmail,
            to,
            cc = [],
            bcc = [],
            subject,
            bodyHtml,
            bodyText,
            attachments = []
        } = body;

        const toList = Array.isArray(to) ? to : (to ? [to] : []);
        if (toList.length === 0) {
            return apiError('At least one recipient (to) is required', 400);
        }

        if (!subject || (!bodyHtml && !bodyText)) {
            return apiError('Subject and message content are required', 400);
        }

        // Verify authorization if a specific mailbox identity was chosen
        const cleanFromMailbox = fromEmail?.trim().toLowerCase() || null;
        if (cleanFromMailbox) {
            const isAuthorized = await isUserAuthorizedForMailbox(auth.user.id, cleanFromMailbox, auth.workspaceId);
            if (!isAuthorized) {
                return apiError(`Unauthorized: You are not assigned to send emails from ${cleanFromMailbox}`, 403);
            }
        }

        const { resend, defaultFromEmail } = await getResendClient(auth.workspaceId);
        const { formattedFrom, pureEmail, replyTo, fallbackFrom, fallbackEmail, userName } = resolveUserSender(
            auth.user,
            defaultFromEmail,
            senderName,
            cleanFromMailbox
        );

        // Threading Context
        let existingThread = null;
        let inReplyTo = null;
        let references = null;

        if (threadId) {
            existingThread = await prisma.crmEmailThread.findFirst({
                where: { id: threadId, workspaceId: auth.workspaceId },
                include: {
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    }
                }
            });

            if (existingThread && existingThread.messages.length > 0) {
                // Find latest RFC Message-ID to thread correctly
                const lastInboundOrAny = existingThread.messages[0];
                if (lastInboundOrAny?.messageId) {
                    inReplyTo = lastInboundOrAny.messageId;
                    const prevRefs = existingThread.messages
                        .map(m => m.messageId)
                        .filter(Boolean);
                    references = [...new Set(prevRefs)].join(' ');
                }
            }
        }

        // Outbound RFC 2822 Message-ID
        const domain = pureEmail.split('@')[1] || 'devlomatix.com';
        const generatedMessageId = `<crm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@${domain}>`;

        const customHeaders = {
            'Message-ID': generatedMessageId,
            ...(inReplyTo ? { 'In-Reply-To': inReplyTo } : {}),
            ...(references ? { 'References': references } : {})
        };

        // Dispatch via Resend
        const emailPayload = {
            from: formattedFrom,
            to: toList,
            cc: cc.length > 0 ? cc : undefined,
            bcc: bcc.length > 0 ? bcc : undefined,
            reply_to: replyTo || auth.user?.email || undefined,
            subject,
            html: bodyHtml || `<pre>${bodyText}</pre>`,
            text: bodyText || (bodyHtml ? bodyHtml.replace(/<[^>]+>/g, '') : ''),
            headers: customHeaders
        };

        if (attachments.length > 0) {
            emailPayload.attachments = attachments.map(att => ({
                filename: att.filename,
                content: att.content, // base64 or path
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
            console.error('[RESEND_OUTBOUND_ERROR]', resendError);
            return apiError(`Failed to send email via Resend: ${resendError.message}`, 400);
        }

        const resendEmailId = resendData?.id || null;
        const snippet = (bodyText || bodyHtml.replace(/<[^>]+>/g, '') || '').slice(0, 160).trim();

        // Find or create thread
        let thread = existingThread;
        if (!thread) {
            thread = await prisma.crmEmailThread.create({
                data: {
                    workspaceId: auth.workspaceId,
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

        // Save Outbound Message
        const message = await prisma.crmEmailMessage.create({
            data: {
                threadId: thread.id,
                workspaceId: auth.workspaceId,
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
                sentByUserId: auth.user.id
            }
        });

        // Save Attachments metadata
        if (attachments.length > 0) {
            await prisma.crmEmailAttachment.createMany({
                data: attachments.map(att => ({
                    messageId: message.id,
                    filename: att.filename || 'attachment',
                    contentType: att.contentType || 'application/octet-stream',
                    size: att.size || 0,
                    url: att.url || ''
                }))
            });
        }

        // Log Unified CRM Activity
        await prisma.crmActivity.create({
            data: {
                workspaceId: auth.workspaceId,
                userId: auth.user.id,
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
        }).catch(err => console.warn('[CRM_ACTIVITY_OUTBOUND_WARN]', err.message));

        // Real-Time Socket Broadcast
        try {
            await emitKonnectxEvent(auth.workspaceId, 'crm:mailbox:email_sent', {
                workspaceId: auth.workspaceId,
                threadId: thread.id,
                messageId: message.id,
                resendEmailId,
                subject,
                to: toList,
                sentBy: auth.user.displayName
            });
        } catch (socketErr) {
            console.warn('[SOCKET_BRIDGE_OUTBOUND_WARN]', socketErr.message);
        }

        return apiSuccess({
            sent: true,
            resendEmailId,
            threadId: thread.id,
            messageId: message.id
        });
    } catch (error) {
        console.error('[CRM_MAILBOX_SEND_ERROR]', error);
        return apiError(error.message, 500);
    }
}
