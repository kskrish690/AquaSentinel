import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';

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

  constructor(private router: Router) {

    this.updateAuthState(this.router.url);

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event) => {

        const navigation = event as NavigationEnd;

        this.updateAuthState(navigation.urlAfterRedirects);

        window.scrollTo(0, 0);
      });
  }

  private updateAuthState(url: string): void {
    this.isAuthPage = url.split('?')[0] === '/auth';
  }
}