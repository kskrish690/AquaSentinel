import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, Messaging } from 'firebase/messaging';
import { firebaseConfig, firebaseVapidKey } from '../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  private messaging: Messaging;

  constructor() {
    const firebaseApp = initializeApp(firebaseConfig);
    this.messaging = getMessaging(firebaseApp);
  }

  async enableNotifications(): Promise<string | null> {
    try {
      if (!('Notification' in window)) {
        console.error('This browser does not support notifications.');
        return null;
      }

      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        console.warn('Notification permission was not granted.');
        return null;
      }

      const serviceWorkerRegistration =
        await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      const token = await getToken(this.messaging, {
        vapidKey: firebaseVapidKey,
        serviceWorkerRegistration
      });

      if (!token) {
        console.error('Firebase did not return a notification token.');
        return null;
      }

      console.log('FCM phone token:', token);

      return token;

    } catch (error) {
      console.error('Firebase push notification setup failed:', error);
      return null;
    }
  }
}