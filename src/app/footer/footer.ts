import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {

  constructor(private router: Router) {}

  // ================================
  // NAVIGATION
  // ================================

  goHome(): void {
    this.router.navigate(['/']);
  }

  goDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goRiskMap(): void {
    this.router.navigate(['/risk-map']);
  }

  goAnalysis(): void {
    this.router.navigate(['/data-analysis']);
  }

  goReplay(): void {
    this.router.navigate(['/replay']);
  }

  goAlerts(): void {
    this.router.navigate(['/alerts']);
  }

  // ================================
  // FOOTER ACTIONS
  // ================================

  openSystemStatus(): void {
    this.router.navigate(['/dashboard']);
  }

  openSensors(): void {
    this.router.navigate(['/data-analysis']);
  }

  openDataPipeline(): void {
    this.router.navigate(['/data-analysis']);
  }

  openModelConfidence(): void {
    this.router.navigate(['/data-analysis']);
  }

  openOfficerAlerts(): void {
    this.router.navigate(['/alerts']);
  }
}