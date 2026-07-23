'use server'

import { db } from '@/lib/db'
import { sendAndroidNotification } from '@/utils/fcm-notification'

export async function sendNotificationToUserAction(userId, title, body, type = 'Notification') {
    try {
        if (!userId) {
            return { success: false, error: 'User ID is required' }
        }

        const user = await db.user.findUnique({
            where: { id: userId },
            select: { deviceToken: true, expoPushToken: true, displayName: true }
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        // We use either deviceToken or expoPushToken if one is available
        const token = user.deviceToken || user.expoPushToken

        if (!token) {
            return { success: false, error: 'User has no registered FCM device token' }
        }

        const result = await sendAndroidNotification({
            token,
            title,
            body,
            data: {
                type: type,
            }
        })

        if (result.success) {
            return { success: true, message: `Notification sent to ${user.displayName || 'user'}!` }
        } else {
            return { success: false, error: result.error || 'Failed to send notification via Firebase' }
        }
    } catch (error) {
        console.error('[sendNotificationToUserAction] Error:', error)
        return { success: false, error: 'Internal server error while sending notification' }
    }
}
