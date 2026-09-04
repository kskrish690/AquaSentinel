import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AlertService, AquaAlert } from '../services/alert.services';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './alerts.html',
  styleUrl: './alerts.css'
})
export class Alerts implements OnInit {

  alerts: AquaAlert[] = [];

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.alertService.alerts$.subscribe(alerts => {
      this.alerts = alerts;
    });
  }

  approveAlert(alert: AquaAlert): void {
    this.alertService.approveAlert(alert.id);
  }

  rejectAlert(alert: AquaAlert): void {
    this.alertService.rejectAlert(alert.id);
  }

  markMonitoring(alert: AquaAlert): void {
    this.alertService.markMonitoring(alert.id);
  }

  removeAlert(alert: AquaAlert): void {
    this.alertService.removeAlert(alert.id);
  }
}