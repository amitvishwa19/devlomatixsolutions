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
export function resolveUserSender(user, defaultFromConfig, customSenderName = null) {
    const parsedConfig = parseEmailAddress(defaultFromConfig, 'Devlomatix');
    const defaultName = parsedConfig.name || 'Devlomatix';
    const defaultEmail = parsedConfig.email || 'noreply@devlomatix.com';

    // The sender email should always be the logged-in user's email if available
    const rawUserEmail = user?.email?.trim();
    const cleanUserEmail = rawUserEmail ? rawUserEmail.replace(/['"<>\s]/g, '').toLowerCase() : '';
    const senderEmail = cleanUserEmail || defaultEmail;

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
 * 1. Plus-addressing in recipient: "inbox+{workspaceId}@domain.com"
 * 2. Recipient matches an existing User -> user's workspace
 * 3. Sender matches an existing Contact in a workspace
 * 4. Fallback to first available workspace in database
 */
export async function resolveWorkspaceForInboundEmail({ to = [], fromEmail }) {
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

    // 2. Check if recipient matches a registered User email
    for (const recipient of to) {
        const { email } = parseEmailAddress(recipient);
        if (!email) continue;

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true }
        });

        if (user) {
            const member = await prisma.member.findFirst({
                where: { userId: user.id },
                select: { serverId: true }
            });
            if (member?.serverId) return member.serverId;
        }
    }

    // 3. Check if sender email matches an existing Contact
    if (fromEmail) {
        const contact = await prisma.contact.findFirst({
            where: { email: { equals: fromEmail, mode: 'insensitive' } },
            select: { workspaceId: true }
        });
        if (contact?.workspaceId) return contact.workspaceId;
    }

    // 4. Fallback: first Server / workspace
    const firstServer = await prisma.server.findFirst({
        select: { id: true }
    });

    return firstServer?.id || 'default-workspace';
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
        const matchedMsg = await prisma.crmEmailMessage.findFirst({
            where: {
                workspaceId,
                messageId: cleanInReplyTo
            },
            select: { threadId: true }
        });

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
            const matchedMsg = await prisma.crmEmailMessage.findFirst({
                where: {
                    workspaceId,
                    messageId: { in: refIds }
                },
                select: { threadId: true }
            });

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
