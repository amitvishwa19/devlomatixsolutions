import { prisma } from '@/lib/prisma';
import { deriveDisplayName } from './threading';

/**
 * Resolves all authorized email identities for a given user based on their
 * personal account and roles/posts assigned in the Organization Builder.
 *
 * Rules:
 * 1. If user is assigned to one or more posts in Org Builder with official mailboxEmails
 *    (e.g., node_vp_sales with sales@devlomatix.com), ONLY those official corporate
 *    emails are authorized and primary.
 * 2. Personal auth emails (e.g. @gmail.com) are excluded from corporate mailbox
 *    operations whenever official mailboxes are assigned.
 * 3. Admins only see mailboxes for posts they are assigned to, preventing unauthorized
 *    cross-department email exposure.
 */
export async function getUserAuthorizedMailboxes(userId, workspaceId = 'global') {
    if (!userId) {
        return {
            user: null,
            isAdmin: false,
            mailboxes: [],
            authorizedEmails: []
        };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                displayName: true,
                username: true,
                email: true,
                role: true,
                avatar: true
            }
        });

        if (!user) {
            return { user: null, isAdmin: false, mailboxes: [], authorizedEmails: [] };
        }

        let isAdmin = ['ADMIN', 'SUPERADMIN', 'DEVELOPER'].includes(user.role);
        if (!isAdmin && workspaceId && workspaceId !== 'global') {
            const isOwner = await prisma.server.findFirst({
                where: { id: workspaceId, userId: user.id },
                select: { id: true }
            });
            const isAdminMember = !isOwner ? await prisma.member.findFirst({
                where: { serverId: workspaceId, userId: user.id, role: 'ADMIN' },
                select: { id: true }
            }) : null;

            if (isOwner || isAdminMember) {
                isAdmin = true;
            }
        }

        const cleanUserEmail = user.email?.trim().toLowerCase() || '';
        const userDisplayName = deriveDisplayName(user.displayName, user.email, 'User');

        // Fetch universal org structure from AppSettings
        const globalRecord = await prisma.appSettings.findUnique({
            where: { key: 'org_structure_global' }
        }).catch(() => null);

        const nodes = (globalRecord?.general && typeof globalRecord.general === 'object')
            ? (globalRecord.general.nodes || {})
            : {};

        const assignedPosts = [];

        Object.values(nodes).forEach((node) => {
            if (!node || !node.id) return;

            // Support both mailboxEmails array and mailboxEmail string (or comma-separated)
            const rawEmails = Array.isArray(node.mailboxEmails) && node.mailboxEmails.length > 0
                ? node.mailboxEmails
                : (typeof node.mailboxEmail === 'string' ? node.mailboxEmail.split(/[,;\s]+/) : []);

            const validEmails = Array.from(new Set(
                rawEmails
                    .map((e) => (typeof e === 'string' ? e.trim().toLowerCase() : ''))
                    .filter((e) => e && e.includes('@'))
            ));

            if (validEmails.length === 0) return;

            const isAssigned = (Array.isArray(node.assignedUserIds) && node.assignedUserIds.includes(userId)) ||
                (cleanUserEmail && validEmails.includes(cleanUserEmail));

            if (isAssigned) {
                validEmails.forEach((email) => {
                    assignedPosts.push({
                        nodeId: `${node.id}_${email}`,
                        roleId: node.id,
                        postTitle: node.title || 'Role Position',
                        department: node.department || 'General',
                        mailboxEmail: email,
                        mailboxDisplayName: node.mailboxDisplayName || node.title || 'Devlomatix',
                        assignedUserIds: node.assignedUserIds || []
                    });
                });
            }
        });

        const authorizedEmailsSet = new Set();
        const mailboxList = [];

        if (assignedPosts.length > 0) {
            // User has official mailboxes assigned in Org Builder
            assignedPosts.forEach((post, index) => {
                if (!authorizedEmailsSet.has(post.mailboxEmail)) {
                    authorizedEmailsSet.add(post.mailboxEmail);
                    mailboxList.push({
                        id: post.nodeId,
                        email: post.mailboxEmail,
                        label: `${post.postTitle} (${post.mailboxEmail})`,
                        type: 'POST',
                        isPrimary: index === 0,
                        postTitle: post.postTitle,
                        department: post.department,
                        displayName: post.mailboxDisplayName
                    });
                }
            });
        } else if (cleanUserEmail) {
            // Fallback: If user has no Org Builder role assigned, use account email
            authorizedEmailsSet.add(cleanUserEmail);
            mailboxList.push({
                id: 'personal',
                email: cleanUserEmail,
                label: `${userDisplayName} (Personal)`,
                type: 'PERSONAL',
                isPrimary: true,
                postTitle: 'Personal Account',
                department: 'Personal',
                displayName: userDisplayName
            });
        }

        const authorizedEmails = Array.from(authorizedEmailsSet);

        // Include "All Inboxes" only if user has multiple assigned mailboxes
        const finalMailboxes = mailboxList.length > 1
            ? [
                {
                    id: 'all',
                    email: 'ALL',
                    label: 'All Inboxes',
                    type: 'ALL',
                    isAll: true,
                    postTitle: 'Unified Feed',
                    department: 'All'
                },
                ...mailboxList
            ]
            : mailboxList;

        return {
            user,
            isAdmin,
            mailboxes: finalMailboxes,
            authorizedEmails
        };
    } catch (err) {
        console.error('[GET_USER_AUTHORIZED_MAILBOXES_ERR]', err);
        return {
            user: null,
            isAdmin: false,
            mailboxes: [],
            authorizedEmails: []
        };
    }
}

/**
 * Validates whether a user is authorized to send or view a specific mailbox address
 */
export async function isUserAuthorizedForMailbox(userId, mailboxEmail, workspaceId = 'global') {
    if (!mailboxEmail || mailboxEmail === 'ALL') return true;
    const { authorizedEmails } = await getUserAuthorizedMailboxes(userId, workspaceId);
    return authorizedEmails.includes(mailboxEmail.trim().toLowerCase());
}

/**
 * Resolves all User IDs authorized to receive notifications for the given recipient email list
 * (matching either direct User.email or Org Builder node assignments).
 */
export async function resolveAuthorizedUserIdsForEmails(emails = []) {
    const cleanEmails = Array.from(new Set(
        (Array.isArray(emails) ? emails : [emails])
            .map((e) => (typeof e === 'string' ? parseEmailAddressSimple(e) : ''))
            .filter((e) => e && e.includes('@'))
    ));

    if (cleanEmails.length === 0) return [];

    const userIdSet = new Set();

    try {
        const users = await prisma.user.findMany({
            where: { email: { in: cleanEmails, mode: 'insensitive' } },
            select: { id: true }
        });
        users.forEach((u) => {
            if (u.id) userIdSet.add(u.id);
        });

        const globalRecord = await prisma.appSettings.findUnique({
            where: { key: 'org_structure_global' }
        }).catch(() => null);

        const nodes = (globalRecord?.general && typeof globalRecord.general === 'object')
            ? (globalRecord.general.nodes || {})
            : {};

        Object.values(nodes).forEach((node) => {
            if (!node) return;
            const rawEmails = Array.isArray(node.mailboxEmails) && node.mailboxEmails.length > 0
                ? node.mailboxEmails
                : (typeof node.mailboxEmail === 'string' ? node.mailboxEmail.split(/[,;\s]+/) : []);

            const validEmails = rawEmails
                .map((e) => (typeof e === 'string' ? e.trim().toLowerCase() : ''))
                .filter(Boolean);

            if (validEmails.some((e) => cleanEmails.includes(e))) {
                const assigned = Array.isArray(node.assignedUserIds) ? node.assignedUserIds : [];
                assigned.forEach((uid) => {
                    if (uid) userIdSet.add(uid);
                });
            }
        });
    } catch (err) {
        console.warn('[RESOLVE_AUTHORIZED_USERS_WARN]', err.message);
    }

    return Array.from(userIdSet);
}

function parseEmailAddressSimple(raw) {
    const cleaned = String(raw || '').trim();
    const match = cleaned.match(/<([^>]+)>/);
    return (match ? match[1] : cleaned).replace(/['"<>\s]/g, '').toLowerCase();
}
