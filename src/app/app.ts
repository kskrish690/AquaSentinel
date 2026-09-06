import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';

import { PushNotificationService } from './services/push-notification.service';
import { EmergencyApiService } from './services/emergency-api.service';

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

  constructor(
    private router: Router,
    private pushNotificationService: PushNotificationService,
    private emergencyApiService: EmergencyApiService
  ) {

    this.updateAuthState(this.router.url);

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event) => {

        const navigation = event as NavigationEnd;

        this.updateAuthState(
          navigation.urlAfterRedirects
        );

        window.scrollTo(0, 0);
      });

    // =====================================================
    // REGISTER PHONE FOR AQUASENTINEL PUSH NOTIFICATIONS
    // =====================================================

    this.registerPhoneNotifications();
  }


  // =====================================================
  // REGISTER PHONE
  // =====================================================

  private async registerPhoneNotifications(): Promise<void> {

    /*
     * Wait until the application has loaded.
     */
    setTimeout(async () => {

      try {

        const token =
          await this.pushNotificationService
            .enableNotifications();

        if (!token) {

          console.warn(
            'AquaSentinel phone notifications were not enabled.'
          );

          return;
        }


        console.log(
          'AquaSentinel FCM token received.'
        );


        // Send the phone token to Railway backend
        this.emergencyApiService
          .registerPushToken(token)
          .subscribe({

            next: (response) => {

              console.log(
                'Phone registered for AquaSentinel SOS:',
                response
              );

            },

            error: (error) => {

              console.error(
                'Failed to register phone for SOS notifications:',
                error
              );

            }

          });

      } catch (error) {

        console.error(
          'Phone notification registration failed:',
          error
        );

      }

    }, 1500);
  }


  // =====================================================
  // AUTH PAGE
  // =====================================================

  private updateAuthState(url: string): void {

    this.isAuthPage =
      url.split('?')[0] === '/auth';

  }
}