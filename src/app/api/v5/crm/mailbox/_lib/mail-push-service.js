import { Expo } from 'expo-server-sdk';
import { sendAndroidNotification } from '@/utils/fcm-notification';
import { db as prisma } from '@/lib/db';

const expo = new Expo();

/**
 * Dispatches push notifications to mobile devices when a new email is received.
 * Supports both Expo Push Notifications (via expo-server-sdk) and direct FCM tokens.
 *
 * @param {Object} params
 * @param {string} params.workspaceId - Workspace ID associated with email
 * @param {string[]} [params.toList] - Recipient email addresses
 * @param {string[]} [params.ccList] - CC email addresses
 * @param {string[]} [params.bccList] - BCC email addresses
 * @param {string} params.fromEmail - Sender email address
 * @param {string} [params.fromName] - Sender display name
 * @param {string} [params.rawFrom] - Full raw from header
 * @param {string} [params.subject] - Email subject
 * @param {string} [params.snippet] - Short email preview text
 * @param {Object} params.thread - Created or updated crmEmailThread record
 * @param {Object} params.message - Created crmEmailMessage record
 */
export async function dispatchMailboxPushNotification({
    workspaceId = 'global',
    toList = [],
    ccList = [],
    bccList = [],
    fromEmail = '',
    fromName = '',
    rawFrom = '',
    subject = '',
    snippet = '',
    thread = null,
    message = null
}) {
    try {
        const cleanRecipients = Array.from(new Set(
            [...(toList || []), ...(ccList || []), ...(bccList || [])]
                .map(e => (typeof e === 'string' ? e.trim().toLowerCase() : ''))
                .filter(e => e && e.includes('@'))
        ));

        if (cleanRecipients.length === 0) {
            console.log('[MAIL_PUSH] No valid recipients specified in email payload');
            return { sent: 0, reason: 'no_recipients' };
        }

        const targetUserIds = new Set();

        // 1. Direct recipient match (users whose account email matches recipient)
        const directUsers = await prisma.user.findMany({
            where: {
                email: { in: cleanRecipients, mode: 'insensitive' }
            },
            select: { id: true }
        });
        directUsers.forEach(u => targetUserIds.add(u.id));

        // 2. Org Builder match (users assigned to posts with mailboxEmail in org_structure_global)
        try {
            const orgRecord = await prisma.appSettings.findUnique({
                where: { key: 'org_structure_global' }
            });
            const nodes = (orgRecord?.general && typeof orgRecord.general === 'object')
                ? (orgRecord.general.nodes || {})
                : {};

            Object.values(nodes).forEach(node => {
                if (!node || !node.id) return;
                const rawEmails = Array.isArray(node.mailboxEmails) && node.mailboxEmails.length > 0
                    ? node.mailboxEmails
                    : (typeof node.mailboxEmail === 'string' ? node.mailboxEmail.split(/[,;\s]+/) : []);

                const nodeEmails = rawEmails
                    .map(e => (typeof e === 'string' ? e.trim().toLowerCase() : ''))
                    .filter(Boolean);

                const hasMatch = nodeEmails.some(ne => cleanRecipients.includes(ne));
                if (hasMatch && Array.isArray(node.assignedUserIds)) {
                    node.assignedUserIds.forEach(uid => {
                        if (uid) targetUserIds.add(uid);
                    });
                }
            });
        } catch (orgErr) {
            console.warn('[MAIL_PUSH_ORG_WARN]', orgErr.message);
        }

        // 3. Fallback: If no users matched, include Admins
        if (targetUserIds.size === 0) {
            const adminUsers = await prisma.user.findMany({
                where: {
                    role: { in: ['ADMIN', 'SUPERADMIN', 'DEVELOPER'] },
                    OR: [
                        { expoPushToken: { not: null } },
                        { deviceToken: { not: null } }
                    ]
                },
                select: { id: true }
            });
            adminUsers.forEach(u => targetUserIds.add(u.id));
        }

        if (targetUserIds.size === 0) {
            console.log('[MAIL_PUSH] No candidate users found for recipients:', cleanRecipients);
            return { sent: 0, reason: 'no_target_users' };
        }

        // 4. Fetch users who have registered push tokens
        const usersToNotify = await prisma.user.findMany({
            where: {
                id: { in: Array.from(targetUserIds) },
                OR: [
                    { expoPushToken: { not: null } },
                    { deviceToken: { not: null } }
                ]
            },
            select: {
                id: true,
                email: true,
                displayName: true,
                expoPushToken: true,
                deviceToken: true
            }
        });

        if (usersToNotify.length === 0) {
            console.log(`[MAIL_PUSH] Found ${targetUserIds.size} recipient user(s), but none currently have push tokens registered.`);
            return { sent: 0, reason: 'no_push_tokens' };
        }

        const pushTitle = `📧 ${fromEmail || fromName || 'New Email'}`;
        const cleanSnippet = (snippet || '').replace(/\s+/g, ' ').trim();
        const pushBody = subject
            ? (cleanSnippet ? `${subject} — ${cleanSnippet.slice(0, 100)}` : subject)
            : (cleanSnippet || 'New email received');

        const pushData = {
            type: 'crm_email',
            threadId: String(thread?.id || ''),
            messageId: String(message?.id || ''),
            fromEmail: String(fromEmail || ''),
            fromName: String(fromName || ''),
            subject: String(subject || '(No Subject)'),
            workspaceId: String(workspaceId || 'global')
        };

        const expoMessages = [];
        const fcmPromises = [];

        for (const user of usersToNotify) {
            // Expo push token handling
            const expoToken = user.expoPushToken;
            if (expoToken && (Expo.isExpoPushToken(expoToken) || expoToken.startsWith('ExponentPushToken') || expoToken.startsWith('ExpoPushToken'))) {
                expoMessages.push({
                    to: expoToken,
                    sound: 'default',
                    title: pushTitle,
                    body: pushBody,
                    data: pushData,
                    priority: 'high',
                    channelId: 'default'
                });
            }

            // Direct FCM token handling (if different from Expo token)
            const fcmToken = user.deviceToken;
            if (fcmToken && !fcmToken.startsWith('ExponentPushToken') && !fcmToken.startsWith('ExpoPushToken') && fcmToken !== expoToken) {
                fcmPromises.push(
                    sendAndroidNotification({
                        token: fcmToken,
                        title: pushTitle,
                        body: pushBody,
                        data: pushData
                    }).catch(err => console.warn('[FCM_MAIL_PUSH_WARN]', err.message))
                );
            }
        }

        // Send Expo push notifications in batches
        let expoTickets = [];
        if (expoMessages.length > 0) {
            const chunks = expo.chunkPushNotifications(expoMessages);
            for (const chunk of chunks) {
                try {
                    const tickets = await expo.sendPushNotificationsAsync(chunk);
                    expoTickets.push(...tickets);
                    console.log('[EXPO_MAIL_PUSH_TICKETS]', tickets);
                } catch (expoErr) {
                    console.error('[EXPO_MAIL_PUSH_ERR]', expoErr.message);
                }
            }
        }

        // Await any direct FCM dispatches
        if (fcmPromises.length > 0) {
            await Promise.allSettled(fcmPromises);
        }

        console.log(`[MAIL_PUSH_SUCCESS] Dispatched push notifications for incoming email "${subject}" to ${usersToNotify.length} user(s) (Expo: ${expoMessages.length}, FCM: ${fcmPromises.length})`);

        return {
            success: true,
            notifiedUsers: usersToNotify.length,
            expoSent: expoMessages.length,
            fcmSent: fcmPromises.length
        };
    } catch (err) {
        console.error('[MAIL_PUSH_DISPATCH_FATAL]', err);
        return { success: false, error: err.message };
    }
}
