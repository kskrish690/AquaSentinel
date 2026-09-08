import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterOutlet,
  NavigationEnd
} from '@angular/router';
import { filter } from 'rxjs/operators';

import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';

import { PushNotificationService } from './services/push-notification.service';
import { EmergencyApiService } from './services/emergency-api.service';
import {
  NotificationService,
  AppNotification
} from './services/notification.services';

@Component({
  selector: 'app-root',
  standalone: true,

  imports: [
    CommonModule,
    RouterOutlet,
    Navbar,
    Footer
  ],

  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  isAuthPage = false;

  showNotificationButton = true;

  notification: AppNotification | null = null;


  constructor(
    private router: Router,
    private pushNotificationService: PushNotificationService,
    private emergencyApiService: EmergencyApiService,
    private notificationService: NotificationService
  ) {

    this.updateAuthState(this.router.url);


    this.notificationService
      .notification$
      .subscribe((notification) => {

        this.notification = notification;

      });


    this.router.events
      .pipe(
        filter(event =>
          event instanceof NavigationEnd
        )
      )
      .subscribe((event) => {

        const navigation =
          event as NavigationEnd;

        this.updateAuthState(
          navigation.urlAfterRedirects
        );

        window.scrollTo(0, 0);
      });
  }


  // =====================================================
  // ENABLE SOS NOTIFICATIONS
  // =====================================================

  async enableSOSNotifications(): Promise<void> {

    // Hide button immediately
    this.showNotificationButton = false;


    try {

      const token =
        await this.pushNotificationService
          .enableNotifications();


      if (!token) {

        this.notificationService.warning(
          'SOS notifications were not enabled on this device.',
          'Notifications not enabled'
        );

        return;
      }


      console.log(
        'AquaSentinal FCM token received.'
      );


      this.emergencyApiService
        .registerPushToken(token)
        .subscribe({

          next: (response) => {

            console.log(
              'Phone registered for AquaSentinal SOS:',
              response
            );

            this.notificationService.success(
              'This device is now registered to receive emergency SOS alerts.',
              'SOS Notifications Enabled'
            );
          },


          error: (error) => {

            console.error(
              'Failed to register phone for SOS notifications:',
              error
            );

            this.notificationService.error(
              'The device could not be registered for emergency alerts.',
              'Registration Failed'
            );
          }

        });

    } catch (error) {

      console.error(
        'SOS notification setup failed:',
        error
      );

      this.notificationService.error(
        'Notification setup could not be completed.',
        'Notification Setup Failed'
      );
    }
  }


  // =====================================================
  // CLOSE NOTIFICATION
  // =====================================================

  closeNotification(): void {

    this.notificationService.close();
  }


  // =====================================================
  // AUTH PAGE
  // =====================================================

  private updateAuthState(url: string): void {

    this.isAuthPage =
      url.split('?')[0] === '/auth';
  }
}