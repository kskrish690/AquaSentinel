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

  /*
   * IMPORTANT:
   *
   * These values allow the Dashboard to render immediately.
   * FastAPI updates them in the background after the page
   * has already appeared.
   */

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

  /*
   * Start with usable dashboard state instead of showing
   * "Calculating..." while Angular waits for FastAPI.
   */
  modelConnected = true;

  modelLoading = false;

  modelError = '';

  predictionSource = 'FastAPI ML Risk Engine';

  lastUpdated = 'Loading live data...';

  private predictionInProgress = false;


  // =====================================================
  // ENVIRONMENTAL DATA
  // =====================================================

  /*
   * These are the initial pilot-region values.
   * FastAPI/weather data can update them later.
   */

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
    private riskApiService: RiskApiService
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    /*
     * Load everything required for the visible Dashboard
     * immediately.
     */

    this.loadUser();

    this.loadRole();

    /*
     * IMPORTANT:
     *
     * Do NOT wait for FastAPI before rendering the Dashboard.
     *
     * The page already has pilot values above.
     * FastAPI will update them in the background.
     */

    setTimeout(() => {

      this.loadMLPrediction();

    }, 0);

  }


  // =====================================================
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {

    if (this.sosTimer) {

      clearTimeout(this.sosTimer);

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

    /*
     * Prevent duplicate API calls.
     */
    if (this.predictionInProgress) {

      return;

    }

    this.predictionInProgress = true;

    /*
     * IMPORTANT:
     *
     * We intentionally DO NOT set:
     *
     * modelLoading = true
     * riskScore = 0
     * riskLevel = ANALYSING
     *
     * because that was the reason the Dashboard initially
     * showed Calculating / Analysing.
     *
     * The existing values remain visible while FastAPI
     * updates them.
     */

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

      /*
       * IMPORTANT:
       * Use the current Dashboard rainfall value.
       *
       * Previously this was 0.
       */
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
            'AquaSentinel Dashboard ML API error:',
            error
          );

          /*
           * IMPORTANT:
           *
           * Keep the already-visible pilot data.
           *
           * Do NOT wipe the Dashboard back to zero.
           */

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


    // ---------------------------------------------------
    // FLOOD PROBABILITY
    // ---------------------------------------------------

    this.floodProbability =
      Number(
        response.flood_probability ?? 0
      );


    // ---------------------------------------------------
    // RISK SCORE
    // ---------------------------------------------------

    this.riskScore =
      Math.round(
        this.floodProbability * 100
      );


    // ---------------------------------------------------
    // RISK LEVEL
    // ---------------------------------------------------

    this.riskLevel =
      (
        response.risk_level ||
        this.getRiskStatus()
      ).toUpperCase();


    // ---------------------------------------------------
    // CONFIDENCE
    // ---------------------------------------------------

    this.confidence =
      Math.round(
        Number(
          response.confidence_pct ?? 0
        )
      );


    // ---------------------------------------------------
    // PREDICTED FLOOD
    // ---------------------------------------------------

    this.predictedFlood =
      Number(
        response.predicted_flood ?? 0
      );


    // ---------------------------------------------------
    // TERRAIN SUSCEPTIBILITY
    // ---------------------------------------------------

    this.terrainSusceptibility =
      Number(
        response.terrain_susceptibility ?? 0
      );


    // ---------------------------------------------------
    // MONSOON
    // ---------------------------------------------------

    this.monsoonSeason =
      Boolean(
        response.monsoon_season
      );


    // ---------------------------------------------------
    // TOP FACTORS
    // ---------------------------------------------------

    this.topFactors =
      response.top_factors || [];


    // ---------------------------------------------------
    // ENVIRONMENTAL VALUES
    // ---------------------------------------------------

    this.terrainExposure =
      Math.round(
        this.terrainSusceptibility * 100
      );


    this.soilWetness =
      this.calculateSoilWetness();


    this.drainageVulnerability =
      this.calculateDrainageVulnerability();


    // ---------------------------------------------------
    // OPERATIONAL VALUES
    // ---------------------------------------------------

    this.updateOperationalStatus();


    // ---------------------------------------------------
    // LEAD TIME
    // ---------------------------------------------------

    this.leadTime =
      this.calculateLeadTime();


    // ---------------------------------------------------
    // SOURCE
    // ---------------------------------------------------

    this.predictionSource =
      response.prediction_source ||
      'FastAPI ML Risk Engine';


    // ---------------------------------------------------
    // LAST UPDATED
    // ---------------------------------------------------

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

      return 'Welcome to AquaSentinel';

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

    /*
     * Prevent unnecessary second navigation.
     */

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

    this.showSOSPasswordModal = true;

  }


  // =====================================================
  // VERIFY SOS PASSWORD
  // =====================================================

  verifySOSPassword(): void {

    const enteredPassword =
      this.sosPassword.trim();


    if (!enteredPassword) {

      this.sosPasswordError =
        'Please enter the SOS authorization password.';

      return;

    }


    this.sosVerifying = true;

    this.sosPasswordError = '';


    if (
      enteredPassword ===
      this.SOS_PASSWORD
    ) {

      this.sosVerifying = false;

      this.showSOSPasswordModal = false;

      this.sosPassword = '';

      this.sosPasswordError = '';

      this.sosMessageVisible = true;


      this.sosTimer =
        setTimeout(() => {

          this.sosMessageVisible = false;

          this.router.navigateByUrl(
            '/emergency'
          );

        }, 3000);

      return;

    }


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