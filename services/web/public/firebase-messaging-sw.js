
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "undefined",
  authDomain: "undefined",
  projectId: "undefined",
  storageBucket: "undefined",
  messagingSenderId: "undefined",
  appId: "undefined",
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
