import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import {
  UserRoleService,
  AquaUser
} from '../services/user-role';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  // =====================================================
  // USER INFORMATION
  // =====================================================

  user: AquaUser | null = null;

  fullName = '';
  designation = '';
  department = '';
  state = '';
  district = '';
  tehsil = '';

  // =====================================================
  // ROLE
  // =====================================================

  role = 'district';

  roleName = 'District Operations';

  // =====================================================
  // PAGE CONTENT
  // =====================================================

  pageTitle = 'District Flood Intelligence';

  pageSubtitle =
    'Localized operational intelligence for monitoring flood risk, vulnerable areas and response actions.';

  primaryAction =
    'View Risk Intelligence';

  // =====================================================
  // RISK DATA
  // =====================================================

  riskScore = 68;

  riskLevel = 'ELEVATED';

  confidence = 86;

  leadTime = '3h 40m';

  // =====================================================
  // ENVIRONMENTAL DATA
  // =====================================================

  rainfall = 74.6;

  soilWetness = 64;

  terrainExposure = 71;

  drainageVulnerability = 55;

  // =====================================================
  // OPERATIONAL DATA
  // =====================================================

  affectedVillages = 4;

  affectedRoads = 3;

  activeAlerts = 2;

  activeSensors = 12;

  totalSensors = 12;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private userRoleService: UserRoleService,
    private router: Router
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadUser();

    this.loadRole();

  }


  // =====================================================
  // LOAD USER
  // =====================================================

  private loadUser(): void {

    this.user =
      this.userRoleService.getUser();

    if (!this.user) {
      return;
    }

    this.fullName =
      this.user.fullName || '';

    this.designation =
      this.user.designation || '';

    this.department =
      this.user.department || '';

    this.state =
      this.user.state || '';

    this.district =
      this.user.district || '';

    this.tehsil =
      this.user.tehsil || '';

  }


  // =====================================================
  // LOAD ROLE
  // =====================================================

  private loadRole(): void {

    this.role =
      this.userRoleService.getRole();

    this.roleName =
      this.userRoleService.getRoleName();

    this.configureDashboard();

  }


  // =====================================================
  // ROLE BASED DASHBOARD
  // =====================================================

  private configureDashboard(): void {

    switch (this.role) {

      // =================================================
      // STATE
      // =================================================

      case 'state':

        this.pageTitle =
          'State Situation Intelligence';

        this.pageSubtitle =
          'Monitor flood conditions across districts, identify emerging hotspots and coordinate state-level response.';

        this.primaryAction =
          'View State Intelligence';

        this.riskScore = 64;

        this.confidence = 89;

        this.affectedVillages = 18;

        this.affectedRoads = 11;

        this.activeAlerts = 5;

        this.activeSensors = 47;

        this.totalSensors = 52;

        this.leadTime = '4h 10m';

        break;


      // =================================================
      // DISTRICT
      // =================================================

      case 'district':

        this.pageTitle =
          'District Flood Intelligence';

        this.pageSubtitle =
          'Monitor localized flood risk across villages, roads, shelters and vulnerable micro-catchments.';

        this.primaryAction =
          'View District Intelligence';

        this.riskScore = 68;

        this.confidence = 86;

        this.affectedVillages = 4;

        this.affectedRoads = 3;

        this.activeAlerts = 2;

        this.activeSensors = 12;

        this.totalSensors = 12;

        this.leadTime = '3h 40m';

        break;


      // =================================================
      // EMERGENCY
      // =================================================

      case 'emergency':

        this.pageTitle =
          'Emergency Control Room';

        this.pageSubtitle =
          'Monitor incoming observations, active alerts, sensor health and rapidly changing flood conditions.';

        this.primaryAction =
          'Open Live Operations';

        this.riskScore = 74;

        this.confidence = 84;

        this.affectedVillages = 4;

        this.affectedRoads = 3;

        this.activeAlerts = 2;

        this.activeSensors = 12;

        this.totalSensors = 12;

        this.leadTime = '2h 55m';

        break;


      // =================================================
      // FIELD
      // =================================================

      case 'field':

        this.pageTitle =
          'Field Response Intelligence';

        this.pageSubtitle =
          'Track active risk zones, evacuation routes, nearby sensors and priority response locations.';

        this.primaryAction =
          'Open Response View';

        this.riskScore = 71;

        this.confidence = 81;

        this.affectedVillages = 4;

        this.affectedRoads = 3;

        this.activeAlerts = 2;

        this.activeSensors = 12;

        this.totalSensors = 12;

        this.leadTime = '2h 40m';

        break;


      // =================================================
      // ANALYST
      // =================================================

      case 'analyst':

        this.pageTitle =
          'Technical Intelligence';

        this.pageSubtitle =
          'Analyse environmental signals, model confidence, sensor quality and risk-factor contributions.';

        this.primaryAction =
          'Open Data Analysis';

        this.riskScore = 68;

        this.confidence = 92;

        this.affectedVillages = 4;

        this.affectedRoads = 3;

        this.activeAlerts = 2;

        this.activeSensors = 12;

        this.totalSensors = 12;

        this.leadTime = '3h 40m';

        break;


      // =================================================
      // DEFAULT
      // =================================================

      default:

        this.pageTitle =
          'District Flood Intelligence';

        this.pageSubtitle =
          'Localized operational intelligence for monitoring flood risk and response.';

        this.primaryAction =
          'View Risk Intelligence';

        break;

    }

  }


  // =====================================================
  // LOCATION
  // =====================================================

  getLocation(): string {

    const parts: string[] = [];

    if (this.tehsil) {
      parts.push(this.tehsil);
    }

    if (this.district) {
      parts.push(this.district);
    }

    if (this.state) {
      parts.push(this.state);
    }

    if (parts.length > 0) {
      return parts.join(', ');
    }

    return 'Mandakini Micro-Catchment';

  }


  // =====================================================
  // GREETING
  // =====================================================

  getGreeting(): string {

    if (!this.fullName) {
      return 'Welcome to aquasentinal';
    }

    const firstName =
      this.fullName.trim().split(' ')[0];

    return `Welcome back, ${firstName}`;

  }


  // =====================================================
  // SENSOR HEALTH
  // =====================================================

  getSensorHealth(): number {

    if (this.totalSensors <= 0) {
      return 0;
    }

    return Math.round(
      (this.activeSensors / this.totalSensors) * 100
    );

  }


  // =====================================================
  // RISK STATUS
  // =====================================================

  getRiskStatus(): string {

    if (this.riskScore >= 80) {
      return 'CRITICAL';
    }

    if (this.riskScore >= 61) {
      return 'HIGH';
    }

    if (this.riskScore >= 31) {
      return 'MODERATE';
    }

    return 'LOW';

  }


  // =====================================================
  // RISK CSS CLASS
  // =====================================================

  getRiskClass(): string {

    if (this.riskScore >= 80) {
      return 'critical';
    }

    if (this.riskScore >= 61) {
      return 'high';
    }

    if (this.riskScore >= 31) {
      return 'moderate';
    }

    return 'low';

  }


  // =====================================================
  // DATA ANALYSIS
  // =====================================================

  openDataAnalysis(): void {

    this.router.navigate([
      '/data-analysis'
    ]);

  }


  // =====================================================
  // RISK MAP
  // =====================================================

  openRiskMap(): void {

    this.router.navigate([
      '/risk-map'
    ]);

  }


  // =====================================================
  // ALERTS
  // =====================================================

  openAlerts(): void {

    this.router.navigate([
      '/alerts'
    ]);

  }


  // =====================================================
  // REPLAY
  // =====================================================

  openReplay(): void {

    this.router.navigate([
      '/replay'
    ]);

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  logout(): void {

    this.userRoleService.logout();

    this.router.navigate([
      '/auth'
    ], {
      queryParams: {
        mode: 'login'
      }
    });

  }
sosMessageVisible = false;

triggerSOS(): void {
  this.sosMessageVisible = true;

  setTimeout(() => {
    this.sosMessageVisible = false;
  }, 5000);
}
}