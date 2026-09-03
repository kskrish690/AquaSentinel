import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface EmergencyUnit {
  department: string;
  icon: string;
  officer: string;
  status: 'Alert Sent' | 'Acknowledged' | 'Dispatched' | 'En Route' | 'On Scene';
  statusClass: string;
  time: string;
}

interface TimelineEvent {
  title: string;
  description: string;
  time: string;
  icon: string;
}

@Component({
  selector: 'app-emergency',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emergency.html',
  styleUrl: './emergency.css'
})
export class Emergency implements OnInit, OnDestroy {

  emergencyActive = true;

  incidentId = 'AS-' + Math.floor(100000 + Math.random() * 900000);

  startTime = new Date();

  elapsedSeconds = 0;

  private timer?: ReturnType<typeof setInterval>;
  private simulationTimers: ReturnType<typeof setTimeout>[] = [];

  units: EmergencyUnit[] = [
    {
      department: 'Police',
      icon: '🚔',
      officer: 'Designated Police Officer',
      status: 'Alert Sent',
      statusClass: 'alert',
      time: this.getCurrentTime()
    },
    {
      department: 'Medical / Ambulance',
      icon: '🚑',
      officer: 'Emergency Medical Officer',
      status: 'Alert Sent',
      statusClass: 'alert',
      time: this.getCurrentTime()
    },
    {
      department: 'Fire & Rescue',
      icon: '🚒',
      officer: 'Fire & Rescue Officer',
      status: 'Alert Sent',
      statusClass: 'alert',
      time: this.getCurrentTime()
    },
    {
      department: 'Disaster Management',
      icon: '🏢',
      officer: 'District Emergency Officer',
      status: 'Alert Sent',
      statusClass: 'alert',
      time: this.getCurrentTime()
    },
    {
      department: 'PWD',
      icon: '🚧',
      officer: 'PWD Response Officer',
      status: 'Alert Sent',
      statusClass: 'alert',
      time: this.getCurrentTime()
    },
    {
      department: 'Electricity',
      icon: '⚡',
      officer: 'Electricity Department Officer',
      status: 'Alert Sent',
      statusClass: 'alert',
      time: this.getCurrentTime()
    }
  ];

  timeline: TimelineEvent[] = [
    {
      title: 'SOS Activated',
      description: 'Emergency initiated by the authorized officer.',
      time: this.getCurrentTime(),
      icon: '🆘'
    },
    {
      title: 'Emergency Incident Created',
      description: `Incident ${this.incidentId} created successfully.`,
      time: this.getCurrentTime(),
      icon: '📋'
    },
    {
      title: 'Department Alerts Sent',
      description: 'Designated response officers have been notified.',
      time: this.getCurrentTime(),
      icon: '📡'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startLiveTimer();
    this.startResponseSimulation();
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.simulationTimers.forEach(timer => clearTimeout(timer));
  }

  private startLiveTimer(): void {
    this.timer = setInterval(() => {
      this.elapsedSeconds = Math.floor(
        (Date.now() - this.startTime.getTime()) / 1000
      );
    }, 1000);
  }

  private startResponseSimulation(): void {

    this.scheduleStatusUpdate(
      4000,
      0,
      'Acknowledged',
      'Police officer acknowledged the emergency alert.',
      'Police'
    );

    this.scheduleStatusUpdate(
      6000,
      1,
      'Acknowledged',
      'Medical emergency officer acknowledged the alert.',
      'Medical / Ambulance'
    );

    this.scheduleStatusUpdate(
      8000,
      2,
      'Acknowledged',
      'Fire & Rescue officer acknowledged the alert.',
      'Fire & Rescue'
    );

    this.scheduleStatusUpdate(
      10000,
      3,
      'Acknowledged',
      'District Disaster Management officer acknowledged the alert.',
      'Disaster Management'
    );

    this.scheduleStatusUpdate(
      12000,
      4,
      'Acknowledged',
      'PWD response officer acknowledged the alert.',
      'PWD'
    );

    this.scheduleStatusUpdate(
      14000,
      5,
      'Acknowledged',
      'Electricity department officer acknowledged the alert.',
      'Electricity'
    );

    this.scheduleStatusUpdate(
      18000,
      0,
      'Dispatched',
      'Police response unit has been dispatched.',
      'Police'
    );

    this.scheduleStatusUpdate(
      20000,
      1,
      'Dispatched',
      'Ambulance has been dispatched.',
      'Medical / Ambulance'
    );

    this.scheduleStatusUpdate(
      22000,
      2,
      'Dispatched',
      'Fire & Rescue team has been dispatched.',
      'Fire & Rescue'
    );

    this.scheduleStatusUpdate(
      26000,
      0,
      'En Route',
      'Police response unit is en route.',
      'Police'
    );

    this.scheduleStatusUpdate(
      28000,
      1,
      'En Route',
      'Ambulance is en route to the incident location.',
      'Medical / Ambulance'
    );

    this.scheduleStatusUpdate(
      30000,
      2,
      'En Route',
      'Fire & Rescue team is en route.',
      'Fire & Rescue'
    );
  }

  private scheduleStatusUpdate(
    delay: number,
    unitIndex: number,
    status: EmergencyUnit['status'],
    description: string,
    department: string
  ): void {

    const timer = setTimeout(() => {

      const unit = this.units[unitIndex];

      if (!unit) {
        return;
      }

      unit.status = status;
      unit.statusClass = this.getStatusClass(status);
      unit.time = this.getCurrentTime();

      this.timeline.unshift({
        title: `${department} — ${status}`,
        description,
        time: this.getCurrentTime(),
        icon: this.getStatusIcon(status)
      });

    }, delay);

    this.simulationTimers.push(timer);
  }

  getStatusClass(status: string): string {

    switch (status) {

      case 'Acknowledged':
        return 'acknowledged';

      case 'Dispatched':
        return 'dispatched';

      case 'En Route':
        return 'enroute';

      case 'On Scene':
        return 'onscene';

      default:
        return 'alert';
    }
  }

  getStatusIcon(status: string): string {

    switch (status) {

      case 'Acknowledged':
        return '✓';

      case 'Dispatched':
        return '📤';

      case 'En Route':
        return '🚗';

      case 'On Scene':
        return '📍';

      default:
        return '🔔';
    }
  }

  get elapsedTime(): string {

    const hours = Math.floor(this.elapsedSeconds / 3600);

    const minutes = Math.floor(
      (this.elapsedSeconds % 3600) / 60
    );

    const seconds = this.elapsedSeconds % 60;

    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  private pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

  getCurrentTime(): string {

    return new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

  }

  get acknowledgedCount(): number {

    return this.units.filter(
      unit =>
        unit.status !== 'Alert Sent'
    ).length;

  }

  get dispatchedCount(): number {

    return this.units.filter(
      unit =>
        unit.status === 'Dispatched' ||
        unit.status === 'En Route' ||
        unit.status === 'On Scene'
    ).length;

  }

  closeEmergency(): void {

    this.emergencyActive = false;

    this.timeline.unshift({
      title: 'Emergency Closed',
      description: 'Emergency incident was closed by the authorized officer.',
      time: this.getCurrentTime(),
      icon: '✓'
    });

  }

  backToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

}