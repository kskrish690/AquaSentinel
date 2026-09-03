import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  UserRoleService,
  AquaUser
} from '../services/user-role';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {

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

  primaryAction = 'View Risk Intelligence';


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
  // SOS
  // =====================================================

  sosMessageVisible = false;

  sosMessage =
    'SOS activated. Emergency response units are being alerted.';

  private sosTimer?: ReturnType<typeof setTimeout>;


  // =====================================================
  // SOS PASSWORD AUTHORIZATION
  // =====================================================

  /*
   * Fixed programmer-defined password.
   * Officer cannot create, change or reset it.
   */
  private readonly SOS_PASSWORD = 'Aquas#$';

  showSOSPasswordModal = false;

  sosPassword = '';

  sosPasswordError = '';

  sosVerifying = false;


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
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {

    if (this.sosTimer) {
      clearTimeout(this.sosTimer);
    }

  }


  // =====================================================
  // LOAD USER
  // =====================================================

  private loadUser(): void {

    this.user = this.userRoleService.getUser();

    if (!this.user) {
      return;
    }

    this.fullName = this.user.fullName || '';
    this.designation = this.user.designation || '';
    this.department = this.user.department || '';
    this.state = this.user.state || '';
    this.district = this.user.district || '';
    this.tehsil = this.user.tehsil || '';

  }


  // =====================================================
  // LOAD ROLE
  // =====================================================

  private loadRole(): void {

    this.role = this.userRoleService.getRole();

    this.roleName = this.userRoleService.getRoleName();

    this.configureDashboard();

  }


  // =====================================================
  // ROLE BASED DASHBOARD
  // =====================================================

  private configureDashboard(): void {

    switch (this.role) {

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
      return 'Welcome to AquaSentinel';
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
    this.router.navigate(['/data-analysis']);
  }


  // =====================================================
  // RISK MAP
  // =====================================================

  openRiskMap(): void {
    this.router.navigate(['/risk-map']);
  }


  // =====================================================
  // ALERTS
  // =====================================================

  openAlerts(): void {
    this.router.navigate(['/alerts']);
  }


  // =====================================================
  // REPLAY
  // =====================================================

  openReplay(): void {
    this.router.navigate(['/replay']);
  }


  // =====================================================
  // SOS BUTTON
  // =====================================================

  triggerSOS(): void {

    // Cancel previous redirect timer
    if (this.sosTimer) {
      clearTimeout(this.sosTimer);
      this.sosTimer = undefined;
    }

    // Reset everything
    this.sosPassword = '';
    this.sosPasswordError = '';
    this.sosVerifying = false;
    this.sosMessageVisible = false;

    // Open centered password overlay
    this.showSOSPasswordModal = true;

  }


  // =====================================================
  // VERIFY SOS PASSWORD
  // =====================================================

  verifySOSPassword(): void {

    const enteredPassword =
      this.sosPassword.trim();

    // Empty password
    if (!enteredPassword) {

      this.sosPasswordError =
        'Please enter the SOS authorization password.';

      return;

    }

    this.sosVerifying = true;
    this.sosPasswordError = '';


    // Correct password
    if (enteredPassword === this.SOS_PASSWORD) {

      this.sosVerifying = false;

      this.showSOSPasswordModal = false;

      this.sosPassword = '';

      this.sosPasswordError = '';

      // Show existing notification
      this.sosMessageVisible = true;


      // Redirect after 3 seconds
      this.sosTimer = setTimeout(() => {

        this.sosMessageVisible = false;

        this.router.navigate(['/emergency']);

      }, 3000);

      return;

    }


    // Wrong password
    this.sosVerifying = false;

    this.sosPasswordError =
      'Incorrect SOS authorization password. SOS not activated.';

  }


  // =====================================================
  // CANCEL SOS
  // =====================================================

  cancelSOSAuthorization(): void {

    this.showSOSPasswordModal = false;

    this.sosPassword = '';

    this.sosPasswordError = '';

    this.sosVerifying = false;

  }


  // =====================================================
  // CLOSE SOS MESSAGE
  // =====================================================

  closeSOSMessage(): void {

    this.sosMessageVisible = false;

    if (this.sosTimer) {

      clearTimeout(this.sosTimer);

      this.sosTimer = undefined;

    }

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  logout(): void {

    this.userRoleService.logout();

    this.router.navigate(
      ['/auth'],
      {
        queryParams: {
          mode: 'login'
        }
      }
    );

  }

}