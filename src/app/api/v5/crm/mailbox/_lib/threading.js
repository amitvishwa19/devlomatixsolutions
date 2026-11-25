import { prisma } from '@/lib/prisma';

/**
 * Robust human name cleaner and formatter.
 * Handles usernames, email handles, dots, underscores, and hyphens.
 * E.g.:
 *  "amit.vishwakarma" -> "Amit Vishwakarma"
 *  "amit_vishwakarma" -> "Amit Vishwakarma"
 *  "amit vishwakarma" -> "Amit Vishwakarma"
 *  "amit.vishwakarma@devlomatix.com" -> "Amit Vishwakarma"
 *  "noreply@devlomatix.com" -> "Devlomatix"
 */
export function cleanAndFormatName(rawName, fallbackName = 'Devlomatix') {
    if (!rawName || typeof rawName !== 'string') return fallbackName;
    let cleaned = rawName.replace(/[<>\r\n"']/g, '').trim();

    // If it's an email address or handle passed as name, strip the @domain
    if (cleaned.includes('@')) {
        cleaned = cleaned.split('@')[0];
    }

    const lower = cleaned.toLowerCase();
    // System, transactional, or bot addresses default to fallbackName
    if (['noreply', 'no-reply', 'donotreply', 'support', 'crm', 'mailer', 'notifications', 'inbox'].includes(lower)) {
        return fallbackName;
    }

    // Split on dots, underscores, hyphens
    if (/[._-]/.test(cleaned)) {
        const parts = cleaned.split(/[._-]+/).filter(Boolean);
        if (parts.length > 0) {
            return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
        }
    }

    // Split on spaces
    if (cleaned.includes(' ')) {
        return cleaned.split(/\s+/).filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }

    // Single word
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Derives a human-friendly display name from displayName, username, or email handle.
 */
export function deriveDisplayName(name, email, fallbackName = 'Devlomatix') {
    if (name && typeof name === 'string' && name.trim()) {
        return cleanAndFormatName(name, fallbackName);
    }

    if (email && typeof email === 'string' && email.includes('@')) {
        return cleanAndFormatName(email.split('@')[0], fallbackName);
    }

    return fallbackName;
}

/**
 * Extracts display name and clean lowercase email address from any RFC address or raw config string.
 * Strips outer quotes, handles angle brackets, and derives missing names.
 *
 * Examples:
 *   "'Devlomatix <noreply@devlomatix.com>'" -> { name: "Devlomatix", email: "noreply@devlomatix.com" }
 *   "'Amit Vishwakarma<amit.vishwakarma@devlomatix.com>'" -> { name: "Amit Vishwakarma", email: "amit.vishwakarma@devlomatix.com" }
 *   "noreply@devlomatix.com" -> { name: "Devlomatix", email: "noreply@devlomatix.com" }
 */
export function parseEmailAddress(raw, fallbackName = 'Devlomatix') {
    if (!raw || typeof raw !== 'string') {
        return { name: fallbackName, email: '' };
    }

    let cleaned = raw.trim();

    // Strip wrapping single or double quotes repeatedly: e.g. "'...'" or '"..."'
    while (
        (cleaned.startsWith("'") && cleaned.endsWith("'")) ||
        (cleaned.startsWith('"') && cleaned.endsWith('"'))
    ) {
        cleaned = cleaned.slice(1, -1).trim();
    }

    // Match "Name <email@domain.com>", "<email@domain.com>", or "Name<email@domain.com>"
    const angleMatch = cleaned.match(/^(?:([^<]+)\s*)?<([^>]+)>$/);
    if (angleMatch) {
        let name = (angleMatch[1] || '').replace(/['"]/g, '').trim();
        let email = (angleMatch[2] || '').replace(/['"<>\s]/g, '').trim().toLowerCase();

        name = cleanAndFormatName(name, deriveDisplayName('', email, fallbackName));

        return { name, email };
    }

    // Bare email or string with @
    if (cleaned.includes('@')) {
        const email = cleaned.replace(/['"<>\s]/g, '').trim().toLowerCase();
        const name = deriveDisplayName('', email, fallbackName);
        return { name, email };
    }

    return {
        name: cleanAndFormatName(cleaned, fallbackName),
        email: ''
    };
}

/**
 * Formats sender strictly into RFC 5322 format:
 *   "Name <email@domain.com>"
 */
export function formatSenderHeader(name, email, fallbackName = 'Devlomatix') {
    const cleanName = cleanAndFormatName(name, fallbackName);
    const cleanEmail = (email || '').replace(/[<>\r\n"'\s]/g, '').trim().toLowerCase();

    if (cleanName && cleanEmail) {
        return `${cleanName} <${cleanEmail}>`;
    }
    if (cleanEmail) {
        return cleanEmail;
    }
    return '';
}

/**
 * Resolves the outbound sender for the logged-in CRM user.
 * The sender email is ALWAYS derived from the logged-in user's email if present,
 * and the name is ALWAYS included in 'Name <email@domain.com>' format.
 */
export function resolveUserSender(user, defaultFromConfig, customSenderName = null, customSenderEmail = null) {
    const parsedConfig = parseEmailAddress(defaultFromConfig, 'Devlomatix');
    const defaultName = parsedConfig.name || 'Devlomatix';
    const defaultEmail = parsedConfig.email || 'noreply@devlomatix.com';

    // The sender email is customSenderEmail (e.g. sales@devlomatix.com) if provided,
    // otherwise the logged-in user's email if available, or fallback system default email
    const rawTargetEmail = (customSenderEmail && typeof customSenderEmail === 'string' && customSenderEmail.trim())
        ? customSenderEmail.trim()
        : user?.email?.trim();
    const cleanTargetEmail = rawTargetEmail ? rawTargetEmail.replace(/['"<>\s]/g, '').toLowerCase() : '';
    const senderEmail = cleanTargetEmail || defaultEmail;

    // Resolve name: custom name > user's displayName > user's username > email handle > defaultName
    const rawName = customSenderName || user?.displayName || user?.username || '';
    const senderName = deriveDisplayName(
        rawName,
        senderEmail,
        defaultName
    );

    // Guaranteed RFC format: 'Name <email@domain.com>'
    const formattedFrom = formatSenderHeader(senderName, senderEmail, defaultName);
    const fallbackFrom = formatSenderHeader(senderName, defaultEmail, defaultName);

    return {
        formattedFrom,
        pureEmail: senderEmail,
        replyTo: senderEmail,
        fallbackFrom,
        fallbackEmail: defaultEmail,
        userName: senderName
    };
}

/**
 * Normalizes an email subject by stripping prefixes like "Re:", "Fwd:", etc.
 */
export function normalizeSubject(subject) {
    if (!subject) return 'No Subject';
    return subject.replace(/^((re|fwd|fw):\s*)+/i, '').trim();
}

/**
 * Resolves the workspaceId for an inbound email.
 * Strategy:
 * 0. In-Reply-To or References matching an existing message in DB -> message's workspaceId
 * 1. Plus-addressing in recipient: "inbox+{workspaceId}@domain.com"
 * 2. Recipient matches an existing User -> user's default/active workspace
 * 3. Recipient matches an Organization Builder Role/Post mailbox -> assigned user's workspace
 * 4. Sender matches an existing Contact in a workspace
 * 5. Fallback to default or first available workspace in database
 */
export async function resolveWorkspaceForInboundEmail({ to = [], fromEmail, inReplyTo, references }) {
    // 0. Match parent message via In-Reply-To or References header
    if (inReplyTo) {
        const cleanInReplyTo = inReplyTo.trim();
        const parentMsg = await prisma.crmEmailMessage.findFirst({
            where: { messageId: cleanInReplyTo },
            select: { workspaceId: true }
        });
        if (parentMsg?.workspaceId) return parentMsg.workspaceId;
    }

    if (references) {
        const refList = references.split(/\s+/).map(r => r.trim()).filter(Boolean);
        if (refList.length > 0) {
            const parentMsg = await prisma.crmEmailMessage.findFirst({
                where: { messageId: { in: refList } },
                select: { workspaceId: true }
            });
            if (parentMsg?.workspaceId) return parentMsg.workspaceId;
        }
    }

    // 1. Check plus-addressing or slug in recipient list
    for (const recipient of to) {
        const { email } = parseEmailAddress(recipient);
        const plusMatch = email.match(/\+([^@]+)@/);
        if (plusMatch && plusMatch[1]) {
            const potentialId = plusMatch[1].trim();
            const server = await prisma.server.findUnique({
                where: { id: potentialId },
                select: { id: true }
            });
            if (server) return server.id;
        }
    }

    // 2. Check if recipient matches a registered User email directly
    for (const recipient of to) {
        const { email } = parseEmailAddress(recipient);
        if (!email) continue;

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true }
        });

        if (user) {
            const server = await prisma.server.findFirst({
                where: { userId: user.id, default: true },
                select: { id: true }
            }) || await prisma.server.findFirst({
                where: { userId: user.id },
                select: { id: true }
            }) || await prisma.member.findFirst({
                where: { userId: user.id },
                select: { serverId: true }
            });

            if (server?.id || server?.serverId) return server.id || server.serverId;
        }
    }

    // 3. Check if recipient matches an Organization Builder Role/Post mailbox
    try {
        const globalRecord = await prisma.appSettings.findUnique({
            where: { key: 'org_structure_global' }
        }).catch(() => null);
        const nodes = (globalRecord?.general && typeof globalRecord.general === 'object')
            ? (globalRecord.general.nodes || {})
            : {};

        for (const recipient of to) {
            const { email } = parseEmailAddress(recipient);
            if (!email) continue;
            const cleanRecip = email.toLowerCase();

            for (const node of Object.values(nodes)) {
                if (!node) continue;
                const rawEmails = Array.isArray(node.mailboxEmails) && node.mailboxEmails.length > 0
                    ? node.mailboxEmails
                    : (typeof node.mailboxEmail === 'string' ? node.mailboxEmail.split(/[,;\s]+/) : []);
                const cleanNodeEmails = rawEmails.map(e => (typeof e === 'string' ? e.trim().toLowerCase() : '')).filter(Boolean);

                if (cleanNodeEmails.includes(cleanRecip)) {
                    const assignedUserIds = Array.isArray(node.assignedUserIds) ? node.assignedUserIds : [];
                    for (const uid of assignedUserIds) {
                        const server = await prisma.server.findFirst({
                            where: { userId: uid, default: true },
                            select: { id: true }
                        }) || await prisma.server.findFirst({
                            where: { userId: uid },
                            select: { id: true }
                        }) || await prisma.member.findFirst({
                            where: { userId: uid },
                            select: { serverId: true }
                        });

                        if (server?.id || server?.serverId) return server.id || server.serverId;
                    }
                }
            }
        }
    } catch (orgErr) {
        console.warn('[RESOLVE_WS_ORG_BUILDER_WARN]', orgErr.message);
    }

    // 4. Check if sender email matches an existing Contact
    if (fromEmail) {
        const contact = await prisma.contact.findFirst({
            where: { email: { equals: fromEmail, mode: 'insensitive' } },
            orderBy: { updatedAt: 'desc' },
            select: { workspaceId: true }
        });
        if (contact?.workspaceId) return contact.workspaceId;
    }

    // 5. Fallback: default or first Server / workspace
    const defaultServer = await prisma.server.findFirst({
        where: { default: true },
        select: { id: true }
    }) || await prisma.server.findFirst({
        select: { id: true }
    });

    return defaultServer?.id || 'default-workspace';
}

/**
 * Finds an existing Contact or creates a new LEAD contact.
 */
export async function findOrCreateContact({ workspaceId, fromEmail, fromName }) {
    if (!fromEmail) return null;

    // Check existing contact
    let contact = await prisma.contact.findFirst({
        where: {
            workspaceId,
            email: { equals: fromEmail, mode: 'insensitive' }
        }
    });

    if (contact) return contact;

    // Resolve owner / admin for the new contact
    const firstAdmin = await prisma.member.findFirst({
        where: { serverId: workspaceId },
        include: { user: true }
    });

    const fallbackUserId = firstAdmin?.userId || (await prisma.user.findFirst({ select: { id: true } }))?.id;

    if (!fallbackUserId) return null;

    try {
        contact = await prisma.contact.create({
            data: {
                workspaceId,
                userId: fallbackUserId,
                name: fromName || fromEmail.split('@')[0],
                email: fromEmail,
                phone: `lead_${Date.now()}`, // unique fallback
                type: 'LEAD',
                platform: 'EMAIL',
                tags: ['Inbound Email', 'New Lead']
            }
        });
        return contact;
    } catch (err) {
        console.warn('[CONTACT_AUTO_CREATE_WARN]', err.message);
        // Fallback search in case of concurrent insert
        return await prisma.contact.findFirst({
            where: {
                workspaceId,
                email: { equals: fromEmail, mode: 'insensitive' }
            }
        });
    }
}

/**
 * Finds an active deal for the given contact.
 */
export async function findActiveDealForContact(contactId, workspaceId) {
    if (!contactId) return null;

    return await prisma.deal.findFirst({
        where: {
            workspaceId,
            contactId,
            closedAt: null,
            stage: {
                isWon: false,
                isLost: false
            }
        },
        orderBy: { updatedAt: 'desc' }
    });
}

/**
 * Finds or creates an email thread using RFC 2822 In-Reply-To / References,
 * or subject & contact matching.
 */
export async function findOrCreateEmailThread({
    workspaceId,
    subject,
    inReplyTo,
    references,
    contactId,
    dealId,
    snippet
}) {
    // 1. Try matching via In-Reply-To header
    if (inReplyTo) {
        const cleanInReplyTo = inReplyTo.trim();
        let matchedMsg = await prisma.crmEmailMessage.findFirst({
            where: {
                workspaceId,
                messageId: cleanInReplyTo
            },
            select: { threadId: true }
        });

        if (!matchedMsg) {
            matchedMsg = await prisma.crmEmailMessage.findFirst({
                where: { messageId: cleanInReplyTo },
                select: { threadId: true }
            });
        }

        if (matchedMsg?.threadId) {
            const thread = await prisma.crmEmailThread.findUnique({
                where: { id: matchedMsg.threadId }
            });
            if (thread) return { thread, isNew: false };
        }
    }

    // 2. Try matching via References header
    if (references) {
        const refIds = references
            .split(/\s+/)
            .map(r => r.trim())
            .filter(Boolean);

        if (refIds.length > 0) {
            let matchedMsg = await prisma.crmEmailMessage.findFirst({
                where: {
                    workspaceId,
                    messageId: { in: refIds }
                },
                select: { threadId: true }
            });

            if (!matchedMsg) {
                matchedMsg = await prisma.crmEmailMessage.findFirst({
                    where: { messageId: { in: refIds } },
                    select: { threadId: true }
                });
            }

            if (matchedMsg?.threadId) {
                const thread = await prisma.crmEmailThread.findUnique({
                    where: { id: matchedMsg.threadId }
                });
                if (thread) return { thread, isNew: false };
            }
        }
    }

    // 3. Try matching by normalized subject + contactId (within last 14 days)
    if (contactId && subject) {
        const normalized = normalizeSubject(subject);
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

        const matchedThread = await prisma.crmEmailThread.findFirst({
            where: {
                workspaceId,
                contactId,
                lastMessageAt: { gte: fourteenDaysAgo },
                subject: {
                    contains: normalized,
                    mode: 'insensitive'
                }
            },
            orderBy: { lastMessageAt: 'desc' }
        });

        if (matchedThread) return { thread: matchedThread, isNew: false };
    }

    // 4. Create new thread
    const newThread = await prisma.crmEmailThread.create({
        data: {
            workspaceId,
            subject: subject || 'No Subject',
            snippet: snippet ? snippet.slice(0, 180) : null,
            lastMessageAt: new Date(),
            contactId: contactId || null,
            dealId: dealId || null,
            folder: 'INBOX',
            unreadCount: 1
        }
    });

    return { thread: newThread, isNew: true };
}

/**
 * Resolves all internal email addresses registered in Users or Org Builder posts,
 * and creates INBOX threads + INBOUND messages for internal recipients when an
 * email is sent from within the CRM mailbox (ensuring instant internal delivery
 * even when Resend inbound webhook does not loop back internally).
 */
export async function deliverInternalRecipients({
    from,
    fromEmail,
    fromName,
    to = [],
    cc = [],
    bcc = [],
    subject,
    bodyHtml,
    bodyText,
    snippet,
    messageId,
    inReplyTo,
    references,
    resendEmailId,
    headers = {}
}) {
    const cleanSender = (fromEmail || '').trim().toLowerCase();
    const rawRecipients = [...(Array.isArray(to) ? to : [to]), ...(Array.isArray(cc) ? cc : []), ...(Array.isArray(bcc) ? bcc : [])];
    const recipientEmails = Array.from(new Set(
        rawRecipients
            .map(r => parseEmailAddress(r).email)
            .filter(e => e && e.includes('@') && e !== cleanSender)
    ));

    if (recipientEmails.length === 0) return [];

    // Collect all internal emails from Users and Org Builder
    const internalSet = new Set();
    const users = await prisma.user.findMany({
        where: { email: { in: recipientEmails, mode: 'insensitive' } },
        select: { email: true }
    });
    users.forEach(u => {
        if (u.email) internalSet.add(u.email.trim().toLowerCase());
    });

    const globalRecord = await prisma.appSettings.findUnique({
        where: { key: 'org_structure_global' }
    }).catch(() => null);
    const nodes = (globalRecord?.general && typeof globalRecord.general === 'object')
        ? (globalRecord.general.nodes || {})
        : {};

    Object.values(nodes).forEach(node => {
        if (!node) return;
        const rawEmails = Array.isArray(node.mailboxEmails) && node.mailboxEmails.length > 0
            ? node.mailboxEmails
            : (typeof node.mailboxEmail === 'string' ? node.mailboxEmail.split(/[,;\s]+/) : []);
        rawEmails.forEach(e => {
            const clean = typeof e === 'string' ? e.trim().toLowerCase() : '';
            if (clean && clean.includes('@')) internalSet.add(clean);
        });
    });

    const internalRecipients = recipientEmails.filter(e => internalSet.has(e));
    if (internalRecipients.length === 0) return [];

    // Group recipients by target workspace so each workspace gets one INBOX delivery
    const workspaceMap = new Map();
    for (const recipEmail of internalRecipients) {
        const targetWs = await resolveWorkspaceForInboundEmail({
            to: [recipEmail],
            fromEmail: cleanSender,
            inReplyTo: null,
            references: null
        });
        if (targetWs && !workspaceMap.has(targetWs)) {
            workspaceMap.set(targetWs, recipEmail);
        }
    }

    const delivered = [];
    for (const [targetWorkspaceId, primaryRecip] of workspaceMap.entries()) {
        try {
            if (messageId) {
                const existing = await prisma.crmEmailMessage.findFirst({
                    where: { messageId, workspaceId: targetWorkspaceId, direction: 'INBOUND' },
                    select: { id: true }
                });
                if (existing) continue;
            }

            const contact = await findOrCreateContact({
                workspaceId: targetWorkspaceId,
                fromEmail: cleanSender,
                fromName: fromName || deriveDisplayName('', cleanSender)
            });
            const deal = contact ? await findActiveDealForContact(contact.id, targetWorkspaceId) : null;

            // Match existing thread strictly within targetWorkspaceId
            let targetThread = null;
            if (inReplyTo) {
                const matchedMsg = await prisma.crmEmailMessage.findFirst({
                    where: { workspaceId: targetWorkspaceId, messageId: inReplyTo.trim() },
                    select: { threadId: true }
                });
                if (matchedMsg?.threadId) {
                    targetThread = await prisma.crmEmailThread.findUnique({ where: { id: matchedMsg.threadId } });
                }
            }

            if (!targetThread && references) {
                const refIds = references.split(/\s+/).map(r => r.trim()).filter(Boolean);
                if (refIds.length > 0) {
                    const matchedMsg = await prisma.crmEmailMessage.findFirst({
                        where: { workspaceId: targetWorkspaceId, messageId: { in: refIds } },
                        select: { threadId: true }
                    });
                    if (matchedMsg?.threadId) {
                        targetThread = await prisma.crmEmailThread.findUnique({ where: { id: matchedMsg.threadId } });
                    }
                }
            }

            if (!targetThread) {
                targetThread = await prisma.crmEmailThread.create({
                    data: {
                        workspaceId: targetWorkspaceId,
                        subject: subject || 'No Subject',
                        snippet: snippet ? snippet.slice(0, 180) : null,
                        lastMessageAt: new Date(),
                        contactId: contact?.id || null,
                        dealId: deal?.id || null,
                        folder: 'INBOX',
                        unreadCount: 1
                    }
                });
            } else {
                targetThread = await prisma.crmEmailThread.update({
                    where: { id: targetThread.id },
                    data: {
                        lastMessageAt: new Date(),
                        snippet: snippet ? snippet.slice(0, 180) : targetThread.snippet,
                        unreadCount: { increment: 1 },
                        folder: targetThread.folder === 'TRASH' || targetThread.folder === 'SPAM' ? targetThread.folder : 'INBOX'
                    }
                });
            }

            const inboundMsg = await prisma.crmEmailMessage.create({
                data: {
                    threadId: targetThread.id,
                    workspaceId: targetWorkspaceId,
                    messageId,
                    inReplyTo,
                    references,
                    resendEmailId,
                    direction: 'INBOUND',
                    status: 'RECEIVED',
                    from,
                    fromEmail: cleanSender,
                    to: Array.isArray(to) ? to : [to],
                    cc: Array.isArray(cc) ? cc : [],
                    bcc: Array.isArray(bcc) ? bcc : [],
                    replyTo: cleanSender,
                    subject: subject || '(No Subject)',
                    bodyText,
                    bodyHtml,
                    snippet,
                    headers,
                    isRead: false
                }
            });

            delivered.push({ workspaceId: targetWorkspaceId, threadId: targetThread.id, messageId: inboundMsg.id, recipient: primaryRecip });
        } catch (err) {
            console.warn('[INTERNAL_MAIL_DELIVERY_WARN]', targetWorkspaceId, err.message);
        }
    }

    return delivered;
}
