// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// // Initialize Firebase
// const firebaseapp = initializeApp(firebaseConfig);
// const messaging = getMessaging(firebaseapp);
// //const analytics = getAnalytics(app);
// export default firebaseapp


let messaging;
let firebaseapp;
let deviceToken;


if (typeof window !== "undefined" && "navigator" in window) {
    try {
        firebaseapp = initializeApp(firebaseConfig);
        messaging = getMessaging(firebaseapp);
    } catch (error) {

    }
}



export const getWebDeviceToken = async () => {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {

        getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_PUBLIC_KEY }).then((currentToken) => {
            if (currentToken) {
                deviceToken = currentToken
                console.log('@currentToken from util/firebase', currentToken)
                return currentToken
            } else {

                console.log('No registration token available. Request permission to generate one.');
                return currentToken = null
            }
        }).catch((err) => {
            console.log('An error occurred while retrieving token. ', err);
            return currentToken = null
        });
    }
}


export { messaging, firebaseapp, deviceToken }

