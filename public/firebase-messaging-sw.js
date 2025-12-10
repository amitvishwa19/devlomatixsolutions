// Purpose: Handle incoming push notifications with firebase

importScripts("https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js");

// Initialize Firebase with your project credentials
firebase.initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
})


console.log('process.env.NEXT_PUBLIC_FIREBASE_API_KEY', process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
// Initialize FCM to enable this(sw) to receive push notifications from firebase servers
const messaging = firebase.messaging()

// Listen to background messages from firebase servers
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] received a background notification', payload)



    // Extract the required details from the payload
    const notificationTitle = payload.notification?.title;
    const notificationOptions = {
        body: payload.notification?.body,
        icon: "/assets/icon.webp" || payload.notification?.icon,
        data: { url: payload.fcmOptions?.link || "/" },
    };

    // // Display push notification
    self.registration.showNotification(notificationTitle, notificationOptions);

});

// Handle notification click events
self.addEventListener("notificationclick", (event) => {
    console.log('notification msg reseved addEventListener')


    event.notification.close();
    const targetUrl = event.notification.data?.url || "/";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }) /* Get all open browser tabs controlled by this service worker */
            .then((clientList) => {
                // Loop through each open tab/window
                for (const client of clientList) {
                    if (client.url.includes(targetUrl) && "focus" in client) {
                        return client.focus(); // If a matching tab exists, bring it to the front
                    }
                }
                // If no matching tab is found, open a new one
                return clients.openWindow(targetUrl);
            })
    );
});