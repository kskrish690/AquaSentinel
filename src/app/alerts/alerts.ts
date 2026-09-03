import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './alerts.html',
  styleUrl: './alerts.css'
})
export class Alerts {

  alerts = [
    {
      id: 'ALT-001',
      location: 'Mandakini Micro-Catchment',
      village: 'Silli',
      level: 'HIGH',
      score: 78,
      action: 'Prepare evacuation advisory',
      status: 'Pending Approval'
    },
    {
      id: 'ALT-002',
      location: 'Rudraprayag',
      village: 'Agastyamuni',
      level: 'MODERATE',
      score: 56,
      action: 'Monitor rainfall and drainage',
      status: 'Monitoring'
    },
    {
      id: 'ALT-003',
      location: 'Mandakini Corridor',
      village: 'Ukhimath',
      level: 'CRITICAL',
      score: 88,
      action: 'Close vulnerable road section',
      status: 'Approved'
    }
  ];

  approveAlert(alert: any) {
    alert.status = 'Approved';
  }

  rejectAlert(alert: any) {
    alert.status = 'Rejected';
  }
}