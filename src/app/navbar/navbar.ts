import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoleService, AquaUser } from '../services/user-role';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-navbar',
  standalone: true,
imports: [
  CommonModule,
  RouterLink,
  RouterLinkActive
],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {

  user: AquaUser | null = null;

  menuOpen = false;

  constructor(
    private userRoleService: UserRoleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.userRoleService.getUser();
  }

  get userName(): string {
    return this.user?.fullName || 'Officer';
  }

  get userInitials(): string {
    if (!this.user?.fullName) return 'OF';

    return this.user.fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  get roleName(): string {
    return this.userRoleService.getRoleName();
  }

  get location(): string {
    const district = this.user?.district || 'Rudraprayag';
    const state = this.user?.state || 'Uttarakhand';

    return `${district}, ${state}`;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  goHome(): void {
    this.closeMenu();
    this.router.navigate(['/']);
  }

  goDashboard(): void {
    this.closeMenu();
    this.router.navigate(['/dashboard']);
  }

  goRiskMap(): void {
    this.closeMenu();
    this.router.navigate(['/risk-map']);
  }

  goAnalysis(): void {
    this.closeMenu();
    this.router.navigate(['/data-analysis']);
  }

  goReplay(): void {
    this.closeMenu();
    this.router.navigate(['/replay']);
  }

  goAlerts(): void {
    this.closeMenu();
    this.router.navigate(['/alerts']);
  }

  logout(): void {
    this.closeMenu();

    this.userRoleService.logout();

    this.router.navigate(['/auth'], {
      queryParams: {
        mode: 'login'
      }
    });
  }
}