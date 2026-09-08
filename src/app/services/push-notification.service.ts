
import { Injectable } from '@angular/core';

import { initializeApp } from 'firebase/app';

import {
  getMessaging,
  getToken,
  onMessage,
  Messaging
} from 'firebase/messaging';

import {
  firebaseConfig,
  firebaseVapidKey
} from '../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  private messaging: Messaging;

  constructor() {

    const firebaseApp =
      initializeApp(firebaseConfig);

    this.messaging =
      getMessaging(firebaseApp);

  }


  // =====================================================
  // ENABLE PUSH NOTIFICATIONS
  // =====================================================

  async enableNotifications(): Promise<string | null> {

    try {

      // ===================================================
      // 1. CHECK HTTPS
      // ===================================================

      if (
        location.protocol !== 'https:' &&
        location.hostname !== 'localhost' &&
        location.hostname !== '127.0.0.1'
      ) {

        console.error(
          '❌ FCM requires HTTPS or localhost.'
        );

        return null;

      }


      // ===================================================
      // 2. CHECK NOTIFICATION SUPPORT
      // ===================================================

      if (!('Notification' in window)) {

        console.error(
          '❌ This browser does not support notifications.'
        );

        return null;

      }


      // ===================================================
      // 3. CHECK SERVICE WORKER SUPPORT
      // ===================================================

      if (!('serviceWorker' in navigator)) {

        console.error(
          '❌ This browser does not support Service Workers.'
        );

        return null;

      }


      // ===================================================
      // 4. CHECK NOTIFICATION PERMISSION
      // ===================================================

      let permission =
        Notification.permission;

      console.log(
        '🔔 Current notification permission:',
        permission
      );


      // Ask only if permission has not been decided yet

      if (permission === 'default') {

        permission =
          await Notification.requestPermission();

        console.log(
          '🔔 Notification permission after request:',
          permission
        );

      }


      // ===================================================
      // 5. CHECK PERMISSION
      // ===================================================

      if (permission !== 'granted') {

        console.error(
          '❌ Notification permission was not granted.'
        );

        console.error(
          'Permission:',
          permission
        );

        return null;

      }


      // ===================================================
      // 6. REGISTER FIREBASE SERVICE WORKER
      // ===================================================

      console.log(
        '🔧 Registering Firebase messaging service worker...'
      );

      const serviceWorkerRegistration =
        await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js',
          {
            scope: '/'
          }
        );

      console.log(
        '✅ Firebase messaging service worker registered:',
        serviceWorkerRegistration
      );


      // ===================================================
      // 7. WAIT FOR SERVICE WORKER TO BECOME ACTIVE
      // ===================================================

      console.log(
        '⏳ Waiting for active Service Worker...'
      );


      const activeRegistration =
        await navigator.serviceWorker.ready;


      console.log(
        '✅ Active Service Worker:',
        activeRegistration
      );


      // ===================================================
      // 8. VERIFY ACTIVE SERVICE WORKER
      // ===================================================

      if (!activeRegistration.active) {

        console.error(
          '❌ Service Worker is not active.'
        );

        return null;

      }


      console.log(
        '✅ Service Worker is active.'
      );


      // ===================================================
      // 9. GET FCM TOKEN
      // ===================================================

      console.log(
        '🔑 Requesting FCM token...'
      );


      const token =
        await getToken(
          this.messaging,
          {
            vapidKey:
              firebaseVapidKey,

            serviceWorkerRegistration:
              activeRegistration
          }
        );


      // ===================================================
      // 10. CHECK TOKEN
      // ===================================================

      if (!token) {

        console.error(
          '❌ Firebase did not return an FCM token.'
        );

        return null;

      }


      // ===================================================
      // 11. TOKEN SUCCESS
      // ===================================================

      console.log(
        '========================================'
      );

      console.log(
        '✅ AquaSentinal FCM TOKEN READY'
      );

      console.log(
        token
      );

      console.log(
        '========================================'
      );


      // ===================================================
      // 12. FOREGROUND MESSAGE HANDLER
      // ===================================================

      onMessage(
        this.messaging,
        (payload) => {

          console.log(
            '🚨 AquaSentinal foreground FCM message:',
            payload
          );


          const title =
            payload.notification?.title ||
            '🚨 AquaSentinal SOS Alert';


          const body =
            payload.notification?.body ||
            'Emergency SOS has been activated.';


          // =================================================
          // SHOW FOREGROUND NOTIFICATION
          // =================================================

          if (
            Notification.permission ===
            'granted'
          ) {

            try {

              new Notification(
                title,
                {
                  body,
                  icon: '/favicon.ico'
                }
              );

            } catch (error) {

              console.error(
                '❌ Failed to display foreground notification:',
                error
              );

            }

          }

        }
      );


      // ===================================================
      // 13. SUCCESS
      // ===================================================

      console.log(
        '========================================'
      );

      console.log(
        '🎉 AquaSentinal push notifications are READY'
      );

      console.log(
        '========================================'
      );


      return token;


    } catch (error: any) {

      // ===================================================
      // ERROR HANDLING
      // ===================================================

      console.error(
        '========================================'
      );

      console.error(
        '❌ FIREBASE PUSH NOTIFICATION SETUP FAILED'
      );

      console.error(
        'Error:',
        error
      );

      console.error(
        'Error name:',
        error?.name
      );

      console.error(
        'Error code:',
        error?.code
      );

      console.error(
        'Error message:',
        error?.message
      );

      console.error(
        '========================================'
      );


      return null;

    }

  }

}

