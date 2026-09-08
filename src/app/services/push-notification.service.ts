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

  async enableNotifications(): Promise<string | null> {

    try {

      // =====================================================
      // CHECK NOTIFICATION SUPPORT
      // =====================================================

      if (!('Notification' in window)) {

        console.error(
          'This browser does not support notifications.'
        );

        return null;
      }


      // =====================================================
      // REQUEST NOTIFICATION PERMISSION
      // =====================================================

      const permission =
        await Notification.requestPermission();

      if (permission !== 'granted') {

        console.warn(
          'Notification permission was not granted.'
        );

        return null;
      }


      // =====================================================
      // REGISTER FIREBASE SERVICE WORKER
      // =====================================================

      const serviceWorkerRegistration =
        await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js'
        );

      console.log(
        'Firebase messaging service worker registered.'
      );


      // =====================================================
      // GET FCM TOKEN
      // =====================================================

      const token =
        await getToken(
          this.messaging,
          {
            vapidKey: firebaseVapidKey,
            serviceWorkerRegistration
          }
        );

      if (!token) {

        console.error(
          'Firebase did not return a notification token.'
        );

        return null;
      }

      console.log(
        'FCM phone token:',
        token
      );


      // =====================================================
      // FOREGROUND FCM MESSAGE HANDLER
      // =====================================================

      onMessage(
        this.messaging,
        (payload) => {

          console.log(
            '🚨 AquaSentinal foreground SOS received:',
            payload
          );

          const title =
            payload.notification?.title ||
            '🚨 AquaSentinal SOS Alert';

          const body =
            payload.notification?.body ||
            'Emergency SOS has been activated.';


          // =================================================
          // SHOW NOTIFICATION WHEN APP IS OPEN
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

            } catch (notificationError) {

              console.error(
                'Failed to display foreground notification:',
                notificationError
              );
            }
          }

        }
      );


      // =====================================================
      // SUCCESS
      // =====================================================

      console.log(
        'AquaSentinal push notifications are ready.'
      );

      return token;

    } catch (error) {

      console.error(
        'Firebase push notification setup failed:',
        error
      );

      return null;
    }
  }
}