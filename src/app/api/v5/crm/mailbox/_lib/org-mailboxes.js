import { prisma } from '@/lib/prisma';
import { deriveDisplayName } from './threading';

/**
 * Resolves all authorized email identities for a given user based on their
 * personal account and roles/posts assigned in the Organization Builder.
 *
 * Example:
 * If amit.vishwakarma@devlomatix.com is assigned to:
 * - VP of Sales (mailboxEmail: sales@devlomatix.com)
 * - Executive / Admin (mailboxEmail: admin@devlomatix.com)
 *
 * Then returned identities include:
 * 1. "All Inboxes" (aggregated feed)
 * 2. "Amit Vishwakarma (Personal)" (amit.vishwakarma@devlomatix.com)
 * 3. "VP of Sales (sales@devlomatix.com)"
 * 4. "Executive Office (admin@devlomatix.com)"
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

        const isAdmin = ['ADMIN', 'SUPERADMIN', 'DEVELOPER'].includes(user.role);
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
        const allOrgPosts = [];

        Object.values(nodes).forEach((node) => {
            if (!node || !node.id) return;

            const postEmail = node.mailboxEmail?.trim().toLowerCase();
            if (!postEmail) return;

            const postItem = {
                nodeId: node.id,
                postTitle: node.title || 'Role Position',
                department: node.department || 'General',
                mailboxEmail: postEmail,
                mailboxDisplayName: node.mailboxDisplayName || node.title || 'Devlomatix',
                assignedUserIds: node.assignedUserIds || []
            };

            allOrgPosts.push(postItem);

            const isAssigned = Array.isArray(node.assignedUserIds) && node.assignedUserIds.includes(userId);
            if (isAssigned) {
                assignedPosts.push(postItem);
            }
        });

        // Unique email collector
        const authorizedEmailsSet = new Set();
        if (cleanUserEmail) {
            authorizedEmailsSet.add(cleanUserEmail);
        }

        // Base personal mailbox identity
        const mailboxList = [];

        if (cleanUserEmail) {
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

        // Add posts assigned directly to this user
        assignedPosts.forEach((post) => {
            if (!authorizedEmailsSet.has(post.mailboxEmail)) {
                authorizedEmailsSet.add(post.mailboxEmail);
                mailboxList.push({
                    id: post.nodeId,
                    email: post.mailboxEmail,
                    label: `${post.postTitle} (${post.mailboxEmail})`,
                    type: 'POST',
                    isPrimary: false,
                    postTitle: post.postTitle,
                    department: post.department,
                    displayName: post.mailboxDisplayName
                });
            }
        });

        // If user is Admin, also allow visibility into other department mailboxes
        if (isAdmin) {
            allOrgPosts.forEach((post) => {
                if (!authorizedEmailsSet.has(post.mailboxEmail)) {
                    authorizedEmailsSet.add(post.mailboxEmail);
                    mailboxList.push({
                        id: post.nodeId,
                        email: post.mailboxEmail,
                        label: `${post.postTitle} (${post.mailboxEmail})`,
                        type: 'ADMIN_OVERVIEW',
                        isPrimary: false,
                        postTitle: post.postTitle,
                        department: post.department,
                        displayName: post.mailboxDisplayName
                    });
                }
            });
        }

        const authorizedEmails = Array.from(authorizedEmailsSet);

        // Include "All Inboxes" entry if user has multiple mailboxes
        const finalMailboxes = [
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
        ];

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
    const { authorizedEmails, isAdmin } = await getUserAuthorizedMailboxes(userId, workspaceId);
    if (isAdmin) return true;
    return authorizedEmails.includes(mailboxEmail.trim().toLowerCase());
}
