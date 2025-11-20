
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD-O80LxVNdBU2623R0JdtDgVyaLx7Xveg",
  authDomain: "step2go-2d884.firebaseapp.com",
  projectId: "step2go-2d884",
  storageBucket: "step2go-2d884.firebasestorage.app",
  messagingSenderId: "522202241372",
  appId: "1:522202241372:web:d60b18474c312aa9544999",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/logo-mark.png',
    badge: '/logo-mark.png',
    data: payload.data
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
