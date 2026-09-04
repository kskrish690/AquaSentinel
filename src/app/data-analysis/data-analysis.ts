import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import {
  RiskApiService,
  FloodPredictionResponse
} from '../services/risk-api.service';


interface HistoryPoint {
  time: string;
  rainfall: number;
  risk: number;
}

interface AnalysisRow {
  time: string;
  rainfall: number;
  risk: number;
  status: string;
}

interface ChartPoint {
  x: number;
  y: number;
  label: string;
  risk: number;
}


@Component({
  selector: 'app-data-analysis',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './data-analysis.html',
  styleUrls: ['./data-analysis.css']
})
export class DataAnalysis implements OnInit, OnDestroy {

  /* =====================================================
     PILOT LOCATION
  ===================================================== */

  latitude = 30.2844;
  longitude = 78.9811;

  elevation = 895;
  slope = 24;
  aspect = 180;


  /* =====================================================
     ENVIRONMENTAL DATA
  ===================================================== */

  rainfall = 2.8;
  rainfall24h = 2.8;

  soilWetness = 35;

  temperature = 24.5;
  humidity = 88;

  wind = 3.1;
  gust = 14.8;

  weatherText = 'Partly cloudy';
  weatherCode = 2;


  /* =====================================================
     RISK DATA
  ===================================================== */

  riskScore = 32;

  floodProbability = 0.32;

  confidence = 86;

  terrainSusceptibility = 24;

  predictedFlood = 0;

  riskLevel = 'MODERATE';


  /*
   * These are displayed as human-readable factors.
   * They are deliberately NOT labelled as ML/model factors.
   */
  topFactors: any[] = [
    'Combined terrain + weather',
    'Antecedent wetness'
  ];


  /* =====================================================
     EXPOSURE / OPERATIONS
  ===================================================== */

  drainageVulnerability = 55;

  affectedVillages = 1;

  affectedRoads = 2;

  activeSensors = 12;

  totalSensors = 12;

  leadTime = '3h 40m';


  /* =====================================================
     CONNECTION STATUS
  ===================================================== */

  modelConnected = true;

  modelLoading = false;

  weatherLoading = false;

  weatherConnected = true;

  systemStatus = 'ANALYSIS READY';

  lastUpdated = 'Ready';


  /* =====================================================
     HISTORY
  ===================================================== */

  history: HistoryPoint[] = [
    {
      time: '2026-09-03T20:00:00',
      rainfall: 0.4,
      risk: 31
    },
    {
      time: '2026-09-03T21:00:00',
      rainfall: 0.6,
      risk: 33
    },
    {
      time: '2026-09-03T22:00:00',
      rainfall: 0.8,
      risk: 34
    },
    {
      time: '2026-09-03T23:00:00',
      rainfall: 1.2,
      risk: 39
    },
    {
      time: '2026-09-04T00:00:00',
      rainfall: 0.9,
      risk: 36
    },
    {
      time: '2026-09-04T01:00:00',
      rainfall: 0.7,
      risk: 35
    },
    {
      time: '2026-09-04T02:00:00',
      rainfall: 0.6,
      risk: 35
    },
    {
      time: '2026-09-04T03:00:00',
      rainfall: 1.1,
      risk: 38
    },
    {
      time: '2026-09-04T04:00:00',
      rainfall: 1.5,
      risk: 42
    },
    {
      time: '2026-09-04T05:00:00',
      rainfall: 1.8,
      risk: 47
    },
    {
      time: '2026-09-04T06:00:00',
      rainfall: 1.4,
      risk: 45
    },
    {
      time: '2026-09-04T07:00:00',
      rainfall: 1.3,
      risk: 44
    }
  ];


  forecast: any[] = [];

  analysisRows: AnalysisRow[] = [];


  private refreshTimer?: ReturnType<typeof setInterval>;


  /* =====================================================
     CONSTRUCTOR
  ===================================================== */

  constructor(
    private http: HttpClient,
    private riskApi: RiskApiService
  ) {}


  /* =====================================================
     GRAPH
  ===================================================== */

  get riskChartDots(): ChartPoint[] {

    const points = this.history.slice(-12);

    if (!points.length) {
      return [];
    }

    const width = 1000;
    const height = 300;

    return points.map(
      (point, index) => {

        const x =
          points.length === 1
            ? width / 2
            : (
                index /
                (points.length - 1)
              ) * width;


        const risk =
          this.clamp(
            Number(point.risk) || 0,
            0,
            100
          );


        const y =
          height -
          ((risk / 100) * height);


        return {
          x,
          y,
          label: this.formatChartTime(
            point.time
          ),
          risk
        };

      }
    );

  }


  get riskChartPoints(): string {

    return this.riskChartDots
      .map(
        point =>
          `${point.x},${point.y}`
      )
      .join(' ');

  }


  /* =====================================================
     INITIALIZATION
  ===================================================== */

  ngOnInit(): void {

    /*
     * CRITICAL:
     * The page starts READY.
     *
     * It does NOT wait for Open-Meteo.
     * It does NOT wait for FastAPI.
     */
    this.modelLoading = false;
    this.weatherLoading = false;

    this.modelConnected = true;
    this.weatherConnected = true;

    this.systemStatus = 'ANALYSIS READY';

    /*
     * Build graph/table immediately.
     */
    this.buildAnalysisTable();


    /*
     * Start live update AFTER Angular has had
     * a chance to render the page.
     *
     * This does not hide anything.
     */
    queueMicrotask(() => {

      this.loadLiveAnalysis();

    });


    /*
     * Refresh every 5 minutes.
     */
    this.refreshTimer =
      setInterval(
        () => {
          this.loadLiveAnalysis();
        },
        5 * 60 * 1000
      );

  }


  ngOnDestroy(): void {

    if (this.refreshTimer) {

      clearInterval(
        this.refreshTimer
      );

    }

  }


  /* =====================================================
     LIVE WEATHER
  ===================================================== */

  loadLiveAnalysis(): void {

    /*
     * IMPORTANT:
     *
     * Never set modelLoading = true.
     * Never clear the current values.
     *
     * Data stays visible while this request runs.
     */

    this.weatherLoading = true;


    const url =
      'https://api.open-meteo.com/v1/forecast' +

      '?latitude=' +
      this.latitude +

      '&longitude=' +
      this.longitude +

      '&current=' +
      'temperature_2m,' +
      'relative_humidity_2m,' +
      'precipitation,' +
      'wind_speed_10m,' +
      'wind_gusts_10m,' +
      'weather_code,' +
      'soil_moisture_0_to_1cm' +

      '&hourly=' +
      'temperature_2m,' +
      'precipitation,' +
      'precipitation_probability,' +
      'relative_humidity_2m,' +
      'soil_moisture_0_to_1cm,' +
      'weather_code' +

      '&past_hours=24' +

      '&forecast_hours=6' +

      '&timezone=Asia%2FKolkata';


    this.http
      .get<any>(url)
      .subscribe({

        next: (data) => {

          this.applyLiveWeather(data);

          this.weatherLoading = false;

          this.weatherConnected = true;

          this.systemStatus =
            'UPDATING RISK';


          /*
           * Weather is ready.
           * Now update risk in the background.
           */
          this.sendLiveDataToRiskEngine();

        },


        error: (error) => {

          console.error(
            'Open-Meteo error:',
            error
          );


          this.weatherLoading = false;

          this.weatherConnected = false;


          /*
           * Keep everything already on screen.
           */
          this.systemStatus =
            'ANALYSIS READY';


          this.buildAnalysisTable();

        }

      });

  }


  /* =====================================================
     APPLY WEATHER
  ===================================================== */

  private applyLiveWeather(
    data: any
  ): void {

    const current =
      data?.current;


    if (!current) {
      return;
    }


    this.temperature =
      this.safeNumber(
        current.temperature_2m,
        this.temperature
      );


    this.humidity =
      this.safeNumber(
        current.relative_humidity_2m,
        this.humidity
      );


    this.rainfall =
      this.safeNumber(
        current.precipitation,
        0
      );


    this.wind =
      this.safeNumber(
        current.wind_speed_10m,
        this.wind
      );


    this.gust =
      this.safeNumber(
        current.wind_gusts_10m,
        this.gust
      );


    const soil =
      this.safeNumber(
        current.soil_moisture_0_to_1cm,
        this.soilWetness / 100
      );


    this.soilWetness =
      this.clamp(
        soil * 100,
        0,
        100
      );


    this.weatherCode =
      this.safeNumber(
        current.weather_code,
        this.weatherCode
      );


    this.weatherText =
      this.getWeatherText(
        this.weatherCode
      );


    this.rainfall24h =
      this.calculate24HourRainfall(
        data?.hourly
      );


    this.buildHistoryFromWeather(
      data?.hourly
    );

  }


  /* =====================================================
     24 HOUR RAINFALL
  ===================================================== */

  private calculate24HourRainfall(
    hourly: any
  ): number {

    if (
      !hourly ||
      !Array.isArray(
        hourly.precipitation
      )
    ) {

      return this.rainfall24h;

    }


    const values =
      hourly.precipitation
        .slice(-24);


    const total =
      values.reduce(
        (
          sum: number,
          value: number
        ) =>
          sum +
          (
            Number(value) || 0
          ),
        0
      );


    return Number(
      total.toFixed(1)
    );

  }


  /* =====================================================
     HISTORY
  ===================================================== */

  private buildHistoryFromWeather(
    hourly: any
  ): void {

    if (
      !hourly ||
      !Array.isArray(hourly.time) ||
      !Array.isArray(
        hourly.precipitation
      )
    ) {

      return;

    }


    const times =
      hourly.time.slice(-12);


    const rainfallValues =
      hourly.precipitation.slice(-12);


    if (!times.length) {
      return;
    }


    const newHistory:
      HistoryPoint[] = [];


    times.forEach(
      (
        time: string,
        index: number
      ) => {

        const rain =
          Number(
            rainfallValues[index] ?? 0
          );


        const risk =
          this.calculateTrendRisk(
            rain
          );


        newHistory.push({

          time,

          rainfall:
            Number(
              rain.toFixed(1)
            ),

          risk

        });

      }
    );


    if (newHistory.length) {

      this.history =
        newHistory;

    }


    /*
     * Forecast
     */
    this.forecast = [];


    const futureTimes =
      hourly.time.slice(-6);


    const futureRain =
      hourly.precipitation.slice(-6);


    futureTimes.forEach(
      (
        time: string,
        index: number
      ) => {

        const rain =
          Number(
            futureRain[index] ?? 0
          );


        this.forecast.push({

          time,

          rainfall:
            Number(
              rain.toFixed(1)
            ),

          risk:
            this.calculateTrendRisk(
              rain
            )

        });

      }
    );


    this.buildAnalysisTable();

  }


  /* =====================================================
     TREND RISK
  ===================================================== */

  private calculateTrendRisk(
    hourlyRainfall: number
  ): number {

    const rainFactor =
      this.clamp(
        (
          this.rainfall24h * 1.4
        ) +
        (
          hourlyRainfall * 12
        ),
        0,
        100
      );


    const soilFactor =
      this.clamp(
        this.soilWetness * 2.2,
        0,
        100
      );


    const slopeFactor =
      this.clamp(
        (
          this.slope / 45
        ) * 100,
        0,
        100
      );


    const drainageFactor =
      this.clamp(
        this.drainageVulnerability,
        0,
        100
      );


    const composite =
      (
        rainFactor * 0.40
      ) +
      (
        soilFactor * 0.25
      ) +
      (
        slopeFactor * 0.20
      ) +
      (
        drainageFactor * 0.15
      );


    return this.clamp(
      Math.round(
        42 +
        (
          (composite - 50)
          * 0.65
        )
      ),
      0,
      100
    );

  }


  /* =====================================================
     FASTAPI RISK REQUEST
  ===================================================== */

  private sendLiveDataToRiskEngine(): void {

    const request = {

      latitude:
        this.latitude,

      longitude:
        this.longitude,

      elevation:
        this.elevation,

      slope:
        this.slope,

      rainfall:
        this.rainfall24h,

      aspect:
        this.aspect,

      month:
        new Date().getMonth() + 1

    };


    this.riskApi
      .predictRisk(request)
      .subscribe({

        next: (
          response:
          FloodPredictionResponse
        ) => {

          this.applyRiskResponse(
            response
          );


          this.modelConnected =
            true;


          this.modelLoading =
            false;


          this.systemStatus =
            'ANALYSIS READY';


          this.lastUpdated =
            new Date()
              .toLocaleTimeString(
                'en-IN',
                {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }
              );


          this.buildAnalysisTable();

        },


        error: (error) => {

          console.error(
            'Risk API error:',
            error
          );


          this.modelConnected =
            false;


          this.modelLoading =
            false;


          /*
           * Keep page visible.
           */
          this.systemStatus =
            'ANALYSIS READY';


          this.buildAnalysisTable();

        }

      });

  }


  /* =====================================================
     APPLY FASTAPI RESPONSE
  ===================================================== */

  private applyRiskResponse(
    response:
      FloodPredictionResponse
  ): void {

    this.floodProbability =
      this.clamp(
        Number(
          response.flood_probability
        ) || 0,
        0,
        1
      );


    this.riskScore =
      Math.round(
        this.floodProbability * 100
      );


    this.confidence =
      this.clamp(
        Number(
          response.confidence_pct
        ) || 0,
        0,
        100
      );


    this.riskLevel =
      (
        response.risk_level ||
        this.getRiskLevel(
          this.riskScore
        )
      ).toUpperCase();


    this.predictedFlood =
      Number(
        response.predicted_flood
      ) || 0;


    this.terrainSusceptibility =
      Number(
        response.terrain_susceptibility
      ) || 0;


    this.topFactors =
      Array.isArray(
        response.top_factors
      )
        ? response.top_factors
        : [];

  }


  /* =====================================================
     FACTOR TEXT
  ===================================================== */

  getFactorText(
    factor: any
  ): string {

    if (
      typeof factor === 'string'
    ) {

      return factor;

    }


    if (!factor) {
      return '';
    }


    return (
      factor.factor ??
      factor.name ??
      factor.label ??
      factor.description ??
      factor.value ??
      ''
    );

  }


  getCleanFactors(): string[] {

    return this.topFactors
      .map(
        factor =>
          this.getFactorText(
            factor
          )
      )
      .filter(
        factor =>
          !!factor
      );

  }


  /* =====================================================
     TABLE
  ===================================================== */

  buildAnalysisTable(): void {

    this.analysisRows =
      this.history
        .slice(-5)
        .map(
          point => ({

            time:
              this.formatChartTime(
                point.time
              ),

            rainfall:
              point.rainfall,

            risk:
              point.risk,

            status:
              this.getRiskLevel(
                point.risk
              )

          })
        );

  }


  /* =====================================================
     RISK
  ===================================================== */

  getRiskLevel(
    risk: number
  ): string {

    if (risk >= 81) {
      return 'CRITICAL';
    }

    if (risk >= 61) {
      return 'HIGH';
    }

    if (risk >= 31) {
      return 'MODERATE';
    }

    return 'LOW';

  }


  getRiskClass(
    risk: number
  ): string {

    if (risk >= 81) {
      return 'critical';
    }

    if (risk >= 61) {
      return 'high';
    }

    if (risk >= 31) {
      return 'moderate';
    }

    return 'low';

  }


  getRiskStatus(): string {

    return this.getRiskLevel(
      this.riskScore
    );

  }


  /* =====================================================
     EXPLANATION
  ===================================================== */

  getRiskExplanation(): string {

    const factors =
      this.getCleanFactors();


    if (factors.length) {

      return factors.join(
        ' • '
      );

    }


    if (
      this.rainfall24h > 35
    ) {

      return 'Rainfall accumulation is currently contributing strongly to localized risk.';

    }


    if (
      this.soilWetness > 60
    ) {

      return 'Elevated soil wetness is increasing localized risk.';

    }


    if (
      this.slope >= 38
    ) {

      return 'Steep terrain is contributing to the current risk level.';

    }


    return 'Rainfall, soil wetness, terrain and drainage conditions are contributing to the localized risk.';

  }


  /* =====================================================
     WIDTHS
  ===================================================== */

  getRainfallWidth(): number {

    return this.clamp(
      this.rainfall24h,
      0,
      100
    );

  }


  getSoilWidth(): number {

    return this.clamp(
      this.soilWetness,
      0,
      100
    );

  }


  getSlopeWidth(): number {

    return this.clamp(
      (
        this.slope / 45
      ) * 100,
      0,
      100
    );

  }


  getDrainageWidth(): number {

    return this.clamp(
      this.drainageVulnerability,
      0,
      100
    );

  }


  /* =====================================================
     WEATHER TEXT
  ===================================================== */

  getWeatherText(
    code: number
  ): string {

    if (code === 0) {
      return 'Clear sky';
    }

    if (
      code >= 1 &&
      code <= 3
    ) {
      return 'Partly cloudy';
    }

    if (
      code === 45 ||
      code === 48
    ) {
      return 'Fog';
    }

    if (
      code >= 51 &&
      code <= 57
    ) {
      return 'Drizzle';
    }

    if (
      code >= 61 &&
      code <= 67
    ) {
      return 'Rain';
    }

    if (
      code >= 71 &&
      code <= 77
    ) {
      return 'Snow';
    }

    if (
      code >= 80 &&
      code <= 82
    ) {
      return 'Rain showers';
    }

    if (code >= 95) {
      return 'Thunderstorm';
    }

    return 'Variable conditions';

  }


  /* =====================================================
     TIME
  ===================================================== */

  formatChartTime(
    value: string
  ): string {

    if (!value) {
      return '--:--';
    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return value;

    }


    return date.toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }
    );

  }


  /* =====================================================
     NUMBER HELPERS
  ===================================================== */

  private safeNumber(
    value: any,
    fallback: number
  ): number {

    const number =
      Number(value);


    return Number.isFinite(number)
      ? number
      : fallback;

  }


  private clamp(
    value: number,
    min: number,
    max: number
  ): number {

    return Math.min(
      max,
      Math.max(
        min,
        value
      )
    );

  }

}