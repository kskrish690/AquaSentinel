
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  UserRoleService
} from '../services/user-role';


/* =====================================================
   EMERGENCY SERVICE
===================================================== */

interface EmergencyService {

  department: string;

  icon: string;

  officer: string;

  status:
    | 'Acknowledged'
    | 'Alert Sent'
    | 'Dispatched'
    | 'En Route'
    | 'On Scene';

  statusClass: string;

  time: string;

}


/* =====================================================
   TIMELINE EVENT
===================================================== */

interface TimelineEvent {

  title: string;

  description: string;

  time: string;

  icon: string;

}


/* =====================================================
   EMERGENCY INCIDENT
===================================================== */

interface EmergencyIncident {

  id: string;

  location: string;

  riskLevel: string;

  reportedBy: string;

  activatedAt: string;

}


/* =====================================================
   COMPONENT
===================================================== */

@Component({

  selector: 'app-emergency',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './emergency.html',

  styleUrl: './emergency.css'

})


export class Emergency
  implements OnInit, OnDestroy {


  /* =====================================================
     EMERGENCY STATE
  ===================================================== */

  emergencyActive = true;

  isEmergencyOfficer = false;


  /*
   * Display name of currently logged-in post.
   */
  currentRoleName =
    'Authorized Officer';


  /* =====================================================
     INCIDENT
  ===================================================== */

  incident: EmergencyIncident = {

    id: '',

    location:
      'Mandakini Micro-Catchment, Rudraprayag',

    riskLevel:
      'HIGH',

    reportedBy:
      'Authorized Officer',

    activatedAt:
      ''

  };


  /* =====================================================
     TIMER
  ===================================================== */

  startTime =
    new Date();

  elapsedSeconds =
    0;

  private timer?:
    ReturnType<typeof setInterval>;


  /* =====================================================
     SIX EMERGENCY SERVICES
  ===================================================== */

  units: EmergencyService[] = [

    {

      department:
        'Police',

      icon:
        '🚔',

      officer:
        'Designated Police Officer',

      status:
        'Acknowledged',

      statusClass:
        'acknowledged',

      time:
        this.getCurrentTime()

    },


    {

      department:
        'Medical / Ambulance',

      icon:
        '🚑',

      officer:
        'Emergency Medical Officer',

      status:
        'Acknowledged',

      statusClass:
        'acknowledged',

      time:
        this.getCurrentTime()

    },


    {

      department:
        'Fire & Rescue',

      icon:
        '🚒',

      officer:
        'Fire & Rescue Officer',

      status:
        'Acknowledged',

      statusClass:
        'acknowledged',

      time:
        this.getCurrentTime()

    },


    {

      department:
        'Disaster Management',

      icon:
        '🏢',

      officer:
        'District Emergency Officer',

      status:
        'Acknowledged',

      statusClass:
        'acknowledged',

      time:
        this.getCurrentTime()

    },


    {

      department:
        'PWD',

      icon:
        '🚧',

      officer:
        'PWD Response Officer',

      status:
        'Acknowledged',

      statusClass:
        'acknowledged',

      time:
        this.getCurrentTime()

    },


    {

      department:
        'Electricity',

      icon:
        '⚡',

      officer:
        'Electricity Department Officer',

      status:
        'Acknowledged',

      statusClass:
        'acknowledged',

      time:
        this.getCurrentTime()

    }

  ];


  /* =====================================================
     TIMELINE
  ===================================================== */

  timeline:
    TimelineEvent[] = [];


  /* =====================================================
     CONSTRUCTOR
  ===================================================== */

  constructor(

    private router:
      Router,

    private userRoleService:
      UserRoleService

  ) {}


  /* =====================================================
     INIT
  ===================================================== */

  ngOnInit(): void {

    this.checkOfficerRole();

    this.createIncident();

    this.startLiveTimer();

  }


  /* =====================================================
     DESTROY
  ===================================================== */

  ngOnDestroy(): void {

    if (this.timer) {

      clearInterval(
        this.timer
      );

    }

  }


  /* =====================================================
     CHECK CURRENT ROLE
  ===================================================== */

  private checkOfficerRole(): void {

    const role =
      this.userRoleService.getRole();


    /*
     * ONLY emergency role can deploy
     * and close the incident.
     */

    this.isEmergencyOfficer =
      role === 'emergency';


    /*
     * Official post names
     */

    switch (role) {

      case 'state':

        this.currentRoleName =
          'State Disaster Management Officer';

        break;


      case 'district':

        this.currentRoleName =
          'District Administration';

        break;


      case 'emergency':

        this.currentRoleName =
          'Emergency Operations Officer';

        break;


      case 'field':

        this.currentRoleName =
          'Field Response Officer';

        break;


      case 'analyst':

        this.currentRoleName =
          'Technical/Data Analyst';

        break;


      default:

        this.currentRoleName =
          'Authorized Officer';

        break;

    }

  }


  /* =====================================================
     CREATE INCIDENT
  ===================================================== */

  private createIncident(): void {

    const now =
      new Date();


    this.startTime =
      now;


    const currentTime =
      this.getCurrentTime();


    this.incident = {

      id:
        this.generateIncidentId(),

      location:
        this.getLocation(),

      riskLevel:
        'HIGH',

      reportedBy:
        this.getReportedBy(),

      activatedAt:
        currentTime

    };


    /*
     * IMPORTANT:
     *
     * SOS automatically creates an acknowledged
     * emergency connection with all six departments.
     */

    this.units =
      this.units.map(unit => ({

        ...unit,

        status:
          'Acknowledged',

        statusClass:
          'acknowledged',

        time:
          currentTime

      }));


    /* =================================================
       INITIAL TIMELINE
    ================================================= */

    this.timeline = [

      {

        title:
          'SOS Activated',

        description:
          `Emergency initiated by ${this.currentRoleName}.`,

        time:
          currentTime,

        icon:
          '🆘'

      },


      {

        title:
          'Emergency Incident Created',

        description:
          `Incident ${this.incident.id} created successfully.`,

        time:
          currentTime,

        icon:
          '📋'

      },


      {

        title:
          'Emergency Departments Acknowledged',

        description:
          'All six designated emergency departments have acknowledged the emergency alert.',

        time:
          currentTime,

        icon:
          '✓'

      }

    ];

  }


  /* =====================================================
     LOCATION
  ===================================================== */

  private getLocation(): string {

    const user =
      this.userRoleService.getUser();


    if (!user) {

      return 'Mandakini Micro-Catchment, Rudraprayag';

    }


    const parts:
      string[] = [];


    if (user.tehsil) {

      parts.push(
        user.tehsil
      );

    }


    if (user.district) {

      parts.push(
        user.district
      );

    }


    if (user.state) {

      parts.push(
        user.state
      );

    }


    if (parts.length > 0) {

      return parts.join(
        ', '
      );

    }


    return 'Mandakini Micro-Catchment, Rudraprayag';

  }


  /* =====================================================
     REPORTED BY
  ===================================================== */

  private getReportedBy(): string {

    const user =
      this.userRoleService.getUser();


    if (!user) {

      return this.currentRoleName;

    }


    const name =
      user.fullName ||
      'Authorized Officer';


    return `${name} (${this.currentRoleName})`;

  }


  /* =====================================================
     INCIDENT ID
  ===================================================== */

  private generateIncidentId(): string {

    const now =
      new Date();


    const year =
      now.getFullYear();


    const month =
      String(
        now.getMonth() + 1
      ).padStart(
        2,
        '0'
      );


    const day =
      String(
        now.getDate()
      ).padStart(
        2,
        '0'
      );


    const random =
      Math.floor(
        100 +
        Math.random() * 900
      );


    return `AS-${year}${month}${day}-${random}`;

  }


  /* =====================================================
     LIVE TIMER
  ===================================================== */

  private startLiveTimer(): void {

    this.timer =
      setInterval(() => {

        this.elapsedSeconds =
          Math.floor(

            (

              Date.now() -

              this.startTime.getTime()

            ) / 1000

          );

      }, 1000);

  }


  /* =====================================================
     ELAPSED TIME
  ===================================================== */

  get elapsedTime(): string {

    const hours =
      Math.floor(
        this.elapsedSeconds /
        3600
      );


    const minutes =
      Math.floor(

        (

          this.elapsedSeconds %
          3600

        ) / 60

      );


    const seconds =
      this.elapsedSeconds %
      60;


    return (

      `${this.pad(hours)}:` +

      `${this.pad(minutes)}:` +

      `${this.pad(seconds)}`

    );

  }


  /* =====================================================
     PAD NUMBER
  ===================================================== */

  private pad(
    value: number
  ): string {

    return value
      .toString()
      .padStart(
        2,
        '0'
      );

  }


  /* =====================================================
     CURRENT TIME
  ===================================================== */

  getCurrentTime(): string {

    return new Date()
      .toLocaleTimeString(

        'en-IN',

        {

          hour:
            '2-digit',

          minute:
            '2-digit',

          second:
            '2-digit',

          hour12:
            true

        }

      );

  }


  /* =====================================================
     ALERT INDIVIDUAL DEPARTMENT
     
     ALL FIVE ROLES CAN ALERT.
     
     Emergency Operations Officer can ALSO deploy.
  ===================================================== */

  alertDepartment(
    unit: EmergencyService
  ): void {

    /*
     * Nobody should alert after emergency is closed.
     */

    if (!this.emergencyActive) {

      return;

    }


    /*
     * If already alerted/deployed,
     * don't create another alert.
     */

    if (
      unit.status !== 'Acknowledged'
    ) {

      return;

    }


    const currentTime =
      this.getCurrentTime();


    unit.status =
      'Alert Sent';


    unit.statusClass =
      'alert-sent';


    unit.time =
      currentTime;


    this.timeline.unshift({

      title:
        `${unit.department} — Alert Sent`,

      description:
        `${unit.department} has been individually alerted by ${this.currentRoleName}.`,

      time:
        currentTime,

      icon:
        '🔔'

    });

  }


  /* =====================================================
     DEPLOY SERVICE
     
     ONLY EMERGENCY OPERATIONS OFFICER
  ===================================================== */

  deployService(
    unit: EmergencyService
  ): void {

    /*
     * Security check.
     */

    if (
      !this.isEmergencyOfficer
    ) {

      return;

    }


    if (
      !this.emergencyActive
    ) {

      return;

    }


    /*
     * Deployment is allowed after acknowledgement
     * or after the department has been individually alerted.
     */

    if (

      unit.status !==
        'Acknowledged' &&

      unit.status !==
        'Alert Sent'

    ) {

      return;

    }


    const currentTime =
      this.getCurrentTime();


    unit.status =
      'Dispatched';


    unit.statusClass =
      'dispatched';


    unit.time =
      currentTime;


    this.timeline.unshift({

      title:
        `${unit.department} — Dispatched`,

      description:
        `${unit.department} has been deployed by the Emergency Operations Officer.`,

      time:
        currentTime,

      icon:
        '📤'

    });

  }


  /* =====================================================
     MOVE TO EN ROUTE
     
     ONLY EMERGENCY OPERATIONS OFFICER
  ===================================================== */

  updateToEnRoute(
    unit: EmergencyService
  ): void {

    if (
      !this.isEmergencyOfficer
    ) {

      return;

    }


    if (
      unit.status !==
      'Dispatched'
    ) {

      return;

    }


    const currentTime =
      this.getCurrentTime();


    unit.status =
      'En Route';


    unit.statusClass =
      'enroute';


    unit.time =
      currentTime;


    this.timeline.unshift({

      title:
        `${unit.department} — En Route`,

      description:
        `${unit.department} response unit is now en route to the incident location.`,

      time:
        currentTime,

      icon:
        '🚗'

    });

  }


  /* =====================================================
     MOVE TO ON SCENE
     
     ONLY EMERGENCY OPERATIONS OFFICER
  ===================================================== */

  updateToOnScene(
    unit: EmergencyService
  ): void {

    if (
      !this.isEmergencyOfficer
    ) {

      return;

    }


    if (
      unit.status !==
      'En Route'
    ) {

      return;

    }


    const currentTime =
      this.getCurrentTime();


    unit.status =
      'On Scene';


    unit.statusClass =
      'onscene';


    unit.time =
      currentTime;


    this.timeline.unshift({

      title:
        `${unit.department} — On Scene`,

      description:
        `${unit.department} response unit has reached the incident location.`,

      time:
        currentTime,

      icon:
        '📍'

    });

  }


  /* =====================================================
     STATUS CLASS
  ===================================================== */

  getStatusClass(
    status: string
  ): string {

    switch (status) {

      case 'Acknowledged':

        return 'acknowledged';


      case 'Alert Sent':

        return 'alert-sent';


      case 'Dispatched':

        return 'dispatched';


      case 'En Route':

        return 'enroute';


      case 'On Scene':

        return 'onscene';


      default:

        return 'acknowledged';

    }

  }


  /* =====================================================
     STATUS ICON
  ===================================================== */

  getStatusIcon(
    status: string
  ): string {

    switch (status) {

      case 'Acknowledged':

        return '✓';


      case 'Alert Sent':

        return '🔔';


      case 'Dispatched':

        return '📤';


      case 'En Route':

        return '🚗';


      case 'On Scene':

        return '📍';


      default:

        return '✓';

    }

  }


  /* =====================================================
     ACKNOWLEDGED COUNT
  ===================================================== */

  get acknowledgedCount(): number {

    return this.units.filter(

      unit =>

        unit.status ===
        'Acknowledged' ||

        unit.status ===
        'Alert Sent' ||

        unit.status ===
        'Dispatched' ||

        unit.status ===
        'En Route' ||

        unit.status ===
        'On Scene'

    ).length;

  }


  /* =====================================================
     ALERTED COUNT
  ===================================================== */

  get alertedCount(): number {

    return this.units.filter(

      unit =>

        unit.status ===
        'Alert Sent' ||

        unit.status ===
        'Dispatched' ||

        unit.status ===
        'En Route' ||

        unit.status ===
        'On Scene'

    ).length;

  }


  /* =====================================================
     DEPLOYED COUNT
  ===================================================== */

  get dispatchedCount(): number {

    return this.units.filter(

      unit =>

        unit.status ===
        'Dispatched' ||

        unit.status ===
        'En Route' ||

        unit.status ===
        'On Scene'

    ).length;

  }


  /* =====================================================
     ON-SCENE COUNT
  ===================================================== */

  get onSceneCount(): number {

    return this.units.filter(

      unit =>
        unit.status ===
        'On Scene'

    ).length;

  }


  /* =====================================================
     CLOSE EMERGENCY
     
     ONLY EMERGENCY OPERATIONS OFFICER
  ===================================================== */

  closeEmergency(): void {

    /*
     * Security check.
     */

    if (
      !this.isEmergencyOfficer
    ) {

      return;

    }


    if (
      !this.emergencyActive
    ) {

      return;

    }


    this.emergencyActive =
      false;


    const currentTime =
      this.getCurrentTime();


    this.timeline.unshift({

      title:
        'Emergency Closed',

      description:
        'Emergency incident was closed by the Emergency Operations Officer.',

      time:
        currentTime,

      icon:
        '✓'

    });

  }


  /* =====================================================
     BACK TO DASHBOARD
  ===================================================== */

  backToDashboard(): void {

    this.router.navigate([
      '/dashboard'
    ]);

  }

}
