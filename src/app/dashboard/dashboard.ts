import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  UserRoleService,
  AquaUser
} from '../services/user-role';

import {
  RiskApiService,
  FloodPredictionRequest,
  FloodPredictionResponse
} from '../services/risk-api.service';

import {
  EmergencyApiService
} from '../services/emergency-api.service';

import {
  PushNotificationService
} from '../services/push-notification.service';


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
    'Localized operational intelligence for monitoring flood risk across the Mandakini micro-catchment.';

  primaryAction = 'View Risk Intelligence';


  // =====================================================
  // ML RISK DATA
  // =====================================================

  riskScore = 32;

  riskLevel = 'MODERATE';

  confidence = 86;

  floodProbability = 0.32;

  terrainSusceptibility = 0.24;

  predictedFlood = 0;

  monsoonSeason = true;

  topFactors: string[] = [
    'terrain susceptibility',
    'rainfall',
    'antecedent wetness'
  ];

  modelConnected = true;

  modelLoading = false;

  modelError = '';

  predictionSource = 'FastAPI ML Risk Engine';

  lastUpdated = 'Loading live data...';

  private predictionInProgress = false;


  // =====================================================
  // ENVIRONMENTAL DATA
  // =====================================================

  rainfall = 2.8;

  soilWetness = 35;

  terrainExposure = 24;

  drainageVulnerability = 55;


  // =====================================================
  // OPERATIONAL DATA
  // =====================================================

  affectedVillages = 2;

  affectedRoads = 2;

  activeAlerts = 1;

  activeSensors = 12;

  totalSensors = 12;


  // =====================================================
  // LEAD TIME
  // =====================================================

  leadTime = '4h 10m';


  // =====================================================
  // ML INPUTS
  // =====================================================

  private readonly latitude = 30.2844;

  private readonly longitude = 78.9811;

  private readonly elevation = 900;

  private readonly slope = 24;

  private readonly aspect = 180;


  // =====================================================
  // SOS
  // =====================================================

  sosMessageVisible = false;

  sosMessage =
    'SOS activated. Emergency response units are being alerted.';

  private sosTimer?: ReturnType<typeof setTimeout>;


  // =====================================================
  // SOS FCM STATUS
  // =====================================================

  fcmTokenReady = false;

  fcmRegistrationLoading = false;

  fcmRegistrationError = '';


  // =====================================================
  // SOS PASSWORD AUTHORIZATION
  // =====================================================

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
    private router: Router,
    private riskApiService: RiskApiService,
    private emergencyApiService: EmergencyApiService,
    private pushNotificationService: PushNotificationService
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadUser();

    this.loadRole();

    setTimeout(() => {

      this.loadMLPrediction();

    }, 0);

  }


  // =====================================================
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {

    if (this.sosTimer) {

      clearTimeout(
        this.sosTimer
      );

      this.sosTimer = undefined;

    }

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

      case 'state':

        this.pageTitle =
          'State Situation Intelligence';

        this.pageSubtitle =
          'Monitor emerging flood conditions and localized hotspots across the pilot region.';

        this.primaryAction =
          'View State Intelligence';

        break;


      case 'district':

        this.pageTitle =
          'District Flood Intelligence';

        this.pageSubtitle =
          'Monitor localized flood risk across villages, roads and vulnerable micro-catchments.';

        this.primaryAction =
          'View District Intelligence';

        break;


      case 'emergency':

        this.pageTitle =
          'Emergency Control Room';

        this.pageSubtitle =
          'Monitor incoming observations, active risk conditions and emergency response priorities.';

        this.primaryAction =
          'Open Live Operations';

        break;


      case 'field':

        this.pageTitle =
          'Field Response Intelligence';

        this.pageSubtitle =
          'Track active risk zones, vulnerable locations and priority response areas.';

        this.primaryAction =
          'Open Response View';

        break;


      case 'analyst':

        this.pageTitle =
          'Technical Intelligence';

        this.pageSubtitle =
          'Analyse environmental signals, model confidence and risk-factor contributions.';

        this.primaryAction =
          'Open Data Analysis';

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
  // ML PREDICTION
  // =====================================================

  private loadMLPrediction(): void {

    if (this.predictionInProgress) {

      return;

    }

    this.predictionInProgress = true;

    this.modelError = '';

    const now = new Date();

    const request: FloodPredictionRequest = {

      latitude:
        this.latitude,

      longitude:
        this.longitude,

      elevation:
        this.elevation,

      slope:
        this.slope,

      rainfall:
        this.rainfall,

      aspect:
        this.aspect,

      month:
        now.getMonth() + 1

    };


    this.riskApiService
      .predictRisk(request)
      .subscribe({

        next: (
          response: FloodPredictionResponse
        ) => {

          this.applyMLPrediction(response);

          this.predictionInProgress = false;

        },

        error: (error) => {

          console.error(
            'AquaSentinal Dashboard ML API error:',
            error
          );

          this.modelLoading = false;

          this.modelConnected = false;

          this.modelError =
            'Live ML engine unavailable';

          this.lastUpdated =
            'Live sync unavailable';

          this.predictionInProgress = false;

        }

      });

  }


  // =====================================================
  // APPLY ML RESPONSE
  // =====================================================

  private applyMLPrediction(
    response: FloodPredictionResponse
  ): void {

    this.modelLoading = false;

    this.modelConnected = true;

    this.modelError = '';

    this.floodProbability =
      Number(
        response.flood_probability ?? 0
      );

    this.riskScore =
      Math.round(
        this.floodProbability * 100
      );

    this.riskLevel =
      (
        response.risk_level ||
        this.getRiskStatus()
      ).toUpperCase();

    this.confidence =
      Math.round(
        Number(
          response.confidence_pct ?? 0
        )
      );

    this.predictedFlood =
      Number(
        response.predicted_flood ?? 0
      );

    this.terrainSusceptibility =
      Number(
        response.terrain_susceptibility ?? 0
      );

    this.monsoonSeason =
      Boolean(
        response.monsoon_season
      );

    this.topFactors =
      response.top_factors || [];

    this.terrainExposure =
      Math.round(
        this.terrainSusceptibility * 100
      );

    this.soilWetness =
      this.calculateSoilWetness();

    this.drainageVulnerability =
      this.calculateDrainageVulnerability();

    this.updateOperationalStatus();

    this.leadTime =
      this.calculateLeadTime();

    this.predictionSource =
      response.prediction_source ||
      'FastAPI ML Risk Engine';

    this.lastUpdated =
      new Date().toLocaleTimeString(
        'en-IN',
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      );

  }


  // =====================================================
  // SOIL WETNESS
  // =====================================================

  private calculateSoilWetness(): number {

    if (this.rainfall >= 100) {

      return 85;

    }

    if (this.rainfall >= 50) {

      return 64;

    }

    if (this.rainfall >= 20) {

      return 48;

    }

    return 35;

  }


  // =====================================================
  // DRAINAGE VULNERABILITY
  // =====================================================

  private calculateDrainageVulnerability(): number {

    const value =
      (
        this.terrainExposure * 0.7
      ) +
      (
        (this.slope / 60) * 100 * 0.3
      );

    return Math.min(
      100,
      Math.max(
        0,
        Math.round(value)
      )
    );

  }


  // =====================================================
  // OPERATIONAL STATUS
  // =====================================================

  private updateOperationalStatus(): void {

    if (this.riskScore >= 80) {

      this.activeAlerts = 3;

      this.affectedVillages = 6;

      this.affectedRoads = 5;

      return;

    }

    if (this.riskScore >= 61) {

      this.activeAlerts = 2;

      this.affectedVillages = 4;

      this.affectedRoads = 3;

      return;

    }

    if (this.riskScore >= 31) {

      this.activeAlerts = 1;

      this.affectedVillages = 2;

      this.affectedRoads = 2;

      return;

    }

    this.activeAlerts = 0;

    this.affectedVillages = 0;

    this.affectedRoads = 1;

  }


  // =====================================================
  // LEAD TIME
  // =====================================================

  private calculateLeadTime(): string {

    if (this.riskScore >= 80) {

      return '1h 30m';

    }

    if (this.riskScore >= 61) {

      return '2h 40m';

    }

    if (this.riskScore >= 31) {

      return '4h 10m';

    }

    return '6h+';

  }


  // =====================================================
  // LOCATION
  // =====================================================

  getLocation(): string {

    if (
      this.district &&
      this.district.toLowerCase()
        .includes('rudraprayag')
    ) {

      return `${this.district}, ${this.state || 'Uttarakhand'}`;

    }

    return 'Mandakini Micro-Catchment, Rudraprayag, Uttarakhand';

  }


  // =====================================================
  // GREETING
  // =====================================================

  getGreeting(): string {

    if (!this.fullName) {

      return 'Welcome to AquaSentinal';

    }

    const firstName =
      this.fullName
        .trim()
        .split(' ')[0];

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
      (
        this.activeSensors /
        this.totalSensors
      ) * 100
    );

  }


  // =====================================================
  // RISK STATUS
  // =====================================================

  getRiskStatus(): string {

    if (!this.modelConnected) {

      return 'UNAVAILABLE';

    }

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

    if (!this.modelConnected) {

      return 'unavailable';

    }

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
  // RISK EXPLANATION
  // =====================================================

  getRiskExplanation(): string {

    if (!this.modelConnected) {

      return 'Live ML risk engine is currently unavailable. Showing the latest pilot-region assessment.';

    }

    if (this.topFactors.length > 0) {

      return `The risk assessment identifies ${this.topFactors
        .slice(0, 3)
        .join(', ')} as important contributing factors.`;

    }

    return 'Risk assessment combines terrain and environmental conditions.';

  }


  // =====================================================
  // RECOMMENDED ACTION
  // =====================================================

  getRecommendedAction(): string {

    if (!this.modelConnected) {

      return 'Continue monitoring and verify the live risk engine before operational decisions.';

    }

    if (this.riskScore >= 81) {

      return 'Immediate field verification and evacuation readiness recommended.';

    }

    if (this.riskScore >= 61) {

      return 'Inspect vulnerable roads and prepare local response teams.';

    }

    if (this.riskScore >= 31) {

      return 'Continue monitoring rainfall, terrain and drainage conditions.';

    }

    return 'Continue routine monitoring.';

  }


  // =====================================================
  // DATA ANALYSIS
  // =====================================================

  openDataAnalysis(): void {

    if (
      this.router.url === '/data-analysis'
    ) {

      return;

    }

    this.router.navigateByUrl(
      '/data-analysis'
    );

  }


  // =====================================================
  // RISK MAP
  // =====================================================

  openRiskMap(): void {

    if (
      this.router.url === '/risk-map'
    ) {

      return;

    }

    this.router.navigateByUrl(
      '/risk-map'
    );

  }


  // =====================================================
  // ALERTS
  // =====================================================

  openAlerts(): void {

    if (
      this.router.url === '/alerts'
    ) {

      return;

    }

    this.router.navigateByUrl(
      '/alerts'
    );

  }


  // =====================================================
  // REPLAY
  // =====================================================

  openReplay(): void {

    if (
      this.router.url === '/replay'
    ) {

      return;

    }

    this.router.navigateByUrl(
      '/replay'
    );

  }


  // =====================================================
  // SOS BUTTON
  // =====================================================

  triggerSOS(): void {

    if (this.sosTimer) {

      clearTimeout(
        this.sosTimer
      );

      this.sosTimer = undefined;

    }


    this.sosPassword = '';

    this.sosPasswordError = '';

    this.sosVerifying = false;

    this.sosMessageVisible = false;


    // ===================================================
    // START FCM REGISTRATION
    // ===================================================

    this.fcmRegistrationLoading = true;

    this.fcmRegistrationError = '';

    console.log(
      '🔔 Enable SOS clicked — starting FCM registration...'
    );


    this.pushNotificationService
      .enableNotifications()
      .then((token) => {

        this.fcmRegistrationLoading = false;

        if (token) {

          this.fcmTokenReady = true;

          console.log(
            '✅ SOS FCM token ready:',
            token
          );

        } else {

          this.fcmTokenReady = false;

          this.fcmRegistrationError =
            'FCM token could not be obtained.';

          console.warn(
            '⚠️ SOS FCM token was not obtained.'
          );

        }

      })
      .catch((error) => {

        this.fcmRegistrationLoading = false;

        this.fcmTokenReady = false;

        this.fcmRegistrationError =
          'FCM notification setup failed.';

        console.error(
          '❌ SOS FCM setup failed:',
          error
        );

      });


    // ===================================================
    // SHOW SOS PASSWORD
    // ===================================================

    this.showSOSPasswordModal = true;

  }


  // =====================================================
  // VERIFY SOS PASSWORD
  // =====================================================

  verifySOSPassword(): void {

    const enteredPassword =
      this.sosPassword.trim();


    // ===================================================
    // EMPTY PASSWORD
    // ===================================================

    if (!enteredPassword) {

      this.sosPasswordError =
        'Please enter the SOS authorization password.';

      return;

    }


    this.sosVerifying = true;

    this.sosPasswordError = '';


    // ===================================================
    // PASSWORD VALIDATION
    // ===================================================

    if (
      enteredPassword !==
      this.SOS_PASSWORD
    ) {

      this.sosVerifying = false;

      this.sosPasswordError =
        'Incorrect SOS authorization password. SOS not activated.';

      return;

    }


    // ===================================================
    // PASSWORD CORRECT
    // ===================================================

    this.showSOSPasswordModal = false;

    this.sosPassword = '';

    this.sosPasswordError = '';

    this.sosMessageVisible = true;


    // ===================================================
    // REMOTE SOS NOTIFICATION
    // =====================================================

    console.log(
      '🚨 Sending SOS request to Railway...'
    );


    this.emergencyApiService
      .triggerSOS({

        source:
          'District Control Room',

        department:
          this.department ||
          'District Administration',

        location:
          this.getLocation(),

        riskScore:
          this.riskScore,

        riskLevel:
          this.riskLevel,

        timestamp:
          new Date().toISOString()

      })
      .subscribe({

        next: (response) => {

          console.log(
            '🚨 AquaSentinal SOS notification sent:',
            response
          );

          this.sosMessage =
            'SOS activated. Emergency response units and registered phones have been alerted.';

        },

        error: (error) => {

          console.error(
            '❌ AquaSentinal SOS notification failed:',
            error
          );

          this.sosMessage =
            'SOS activated. Emergency page opened, but phone notification could not be delivered.';

        }

      });


    this.sosVerifying = false;


    // ===================================================
    // OPEN EMERGENCY PAGE
    // ===================================================

    this.sosTimer =
      setTimeout(() => {

        this.sosMessageVisible = false;

        this.router.navigateByUrl(
          '/emergency'
        );

      }, 3000);

  }


  // =====================================================
  // CANCEL SOS AUTHORIZATION
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

      clearTimeout(
        this.sosTimer
      );

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