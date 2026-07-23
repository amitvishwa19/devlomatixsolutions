import admin from 'firebase-admin';

// Initialize Firebase Admin app if it hasn't been initialized already
if (!admin.apps.length) {
    try {
        // Option 1: Use specific ENV vars
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    // Replace escaped newlines in the private key
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });
        } else {
            // Option 2: Default application credentials (GOOGLE_APPLICATION_CREDENTIALS env var pointing to json file)
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
        }
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
    }
}

/**
 * Send an FCM notification to an Android device using its token.
 *
 * @param {Object} params
 * @param {string} params.token - The FCM device token.
 * @param {string} params.title - The title of the notification.
 * @param {string} params.body - The body text of the notification.
 * @param {Object} [params.data] - Optional custom data payload. Keys and values must be strings.
 * @returns {Promise<Object>} - The response from FCM.
 */
export async function sendAndroidNotification({ token, title, body, data = {} }) {
    if (!token) {
        throw new Error('Device token is required to send a notification.');
    }

    // Ensure all data values are strings for FCM
    const flatData = Object.keys(data).reduce((acc, key) => {
        acc[key] = String(data[key]);
        return acc;
    }, {});

    // For expo-notifications to parse custom data properly while receiving direct FCM:
    // 1. It must contain 'projectId' or 'experienceId' to pass Expo's security filter.
    const expoDataPayload = {
        ...flatData
    };

    if (process.env.EXPO_PROJECT_ID) {
        expoDataPayload.projectId = process.env.EXPO_PROJECT_ID;
        expoDataPayload.experienceId = process.env.EXPO_PROJECT_ID;
    }

    const message = {
        token: token,
        notification: {
            title: title || 'Notification',
            body: body || '',
        },
        android: {
            priority: 'high',
            notification: {
                sound: 'default',
            },
        },
        data: expoDataPayload,
    };

    console.log('[fcm-notification] Sending FCM message:', JSON.stringify(message, null, 2));

    try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent Android FCM message:', response);
        return { success: true, response };
    } catch (error) {
        console.error('Error sending Android FCM message:', error);
        return { success: false, error: error.message };
    }
}
