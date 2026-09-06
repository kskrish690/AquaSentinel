importScripts(
  'https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js'
);

firebase.initializeApp({
  apiKey: "AIzaSyCQvCNUaJnX8IhyBHRJSbMZDDVIk0ccEq0",
  authDomain: "aquasentinel-5b215.firebaseapp.com",
  projectId: "aquasentinel-5b215",
  storageBucket: "aquasentinel-5b215.firebasestorage.app",
  messagingSenderId: "419886773980",
  appId: "1:419886773980:web:bb1909925cbc1e49712619"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message:', payload);

  const notificationTitle =
    payload.notification?.title || '🚨 AquaSentinel SOS Alert';

  const notificationOptions = {
    body:
      payload.notification?.body ||
      'Emergency SOS has been activated.',
    icon: '/favicon.ico',
    data: {
      route: '/emergency'
    }
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {

      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate('/emergency');
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow('/emergency');
      }
    })
  );
});