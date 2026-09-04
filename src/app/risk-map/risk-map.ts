import {
  AfterViewInit,
  Component,
  OnDestroy
} from '@angular/core';

import { RiskApiService } from '../services/risk-api.service';
import { AlertService } from '../services/alert.services';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import * as L from 'leaflet';

interface ForecastPoint {
  time: string;
  rainfall: number;
  temperature: number | null;
  probability: number | null;
  risk: number;
}

interface HistoryPoint {
  time: string;
  rainfall: number;
}

interface RiskZone {
  name: string;
  lat: number;
  lng: number;

  baseRisk: number;
  slope: number;
  drainage: number;
  historicalEvents: number;
  exposedPopulation: number;
  vulnerableRoads: number;

  elevation: number;
  aspect: number;

  risk: number;
  rainfall: number;
  rainfall24h: number;
  forecast6hRainfall: number;

  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windGust: number | null;
  soilMoisture: number | null;

  weatherCode: number | null;
  weatherText: string;

  confidence: number;
  predictionSource: string;

  marker?: L.CircleMarker;
  pulse?: L.CircleMarker;
  weatherCircle?: L.Circle;
}

@Component({
  selector: 'app-risk-map',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './risk-map.html',
  styleUrl: './risk-map.css'
})
export class RiskMap
  implements AfterViewInit, OnDestroy {

  private map!: L.Map;

  private streetLayer!: L.TileLayer;
  private terrainLayer!: L.TileLayer;

  private weatherLayer!: L.LayerGroup;
  private riskLayer!: L.LayerGroup;
  private studyAreaLayer!: L.LayerGroup;

  private weatherTimer: any;

  selectedZone = 'Rudraprayag';

  mapStatus = 'INITIALIZING GIS';
  weatherStatus = 'CONNECTING';

  lastUpdated = '--';

  activeBaseMap = 'street';

  showWeatherLayer = true;
  showRiskLayer = true;
  showStudyArea = true;

  alertReviewed = false;

  selectedWeather = {
    temperature: null as number | null,
    humidity: null as number | null,
    rainfall: null as number | null,
    windSpeed: null as number | null,
    windGust: null as number | null,
    soilMoisture: null as number | null,
    weatherText: 'Loading...',
    weatherCode: null as number | null
  };

  forecast: ForecastPoint[] = [];
  rainfallHistory: HistoryPoint[] = [];

  zones: RiskZone[] = [

    {
      name: 'Rudraprayag',
      lat: 30.2844,
      lng: 78.9811,

      baseRisk: 42,
      slope: 24,
      drainage: 55,
      historicalEvents: 4,
      exposedPopulation: 3200,
      vulnerableRoads: 2,

      elevation: 895,
      aspect: 180,

      risk: 42,
      rainfall: 0,
      rainfall24h: 0,
      forecast6hRainfall: 0,

      temperature: null,
      humidity: null,
      windSpeed: null,
      windGust: null,
      soilMoisture: null,

      weatherCode: null,
      weatherText: 'Loading...',

      confidence: 60,
      predictionSource: 'INITIALIZING'
    },

    {
      name: 'Silli',
      lat: 30.3838,
      lng: 79.0091,

      baseRisk: 82,
      slope: 42,
      drainage: 85,
      historicalEvents: 8,
      exposedPopulation: 1450,
      vulnerableRoads: 4,

      elevation: 1100,
      aspect: 165,

      risk: 82,
      rainfall: 0,
      rainfall24h: 0,
      forecast6hRainfall: 0,

      temperature: null,
      humidity: null,
      windSpeed: null,
      windGust: null,
      soilMoisture: null,

      weatherCode: null,
      weatherText: 'Loading...',

      confidence: 60,
      predictionSource: 'INITIALIZING'
    },

    {
      name: 'Agastyamuni',
      lat: 30.3920,
      lng: 79.0260,

      baseRisk: 67,
      slope: 36,
      drainage: 72,
      historicalEvents: 6,
      exposedPopulation: 2100,
      vulnerableRoads: 5,

      elevation: 1000,
      aspect: 175,

      risk: 67,
      rainfall: 0,
      rainfall24h: 0,
      forecast6hRainfall: 0,

      temperature: null,
      humidity: null,
      windSpeed: null,
      windGust: null,
      soilMoisture: null,

      weatherCode: null,
      weatherText: 'Loading...',

      confidence: 60,
      predictionSource: 'INITIALIZING'
    },

    {
      name: 'Ukhimath',
      lat: 30.5139,
      lng: 79.0948,

      baseRisk: 54,
      slope: 31,
      drainage: 65,
      historicalEvents: 5,
      exposedPopulation: 980,
      vulnerableRoads: 3,

      elevation: 1310,
      aspect: 190,

      risk: 54,
      rainfall: 0,
      rainfall24h: 0,
      forecast6hRainfall: 0,

      temperature: null,
      humidity: null,
      windSpeed: null,
      windGust: null,
      soilMoisture: null,

      weatherCode: null,
      weatherText: 'Loading...',

      confidence: 60,
      predictionSource: 'INITIALIZING'
    }

  ];

  villages = this.zones;

  constructor(
    private riskApi: RiskApiService,
    private alertService: AlertService
  ) {}

  ngAfterViewInit(): void {

    setTimeout(() => {
      this.initializeMap();
    }, 100);

  }

  ngOnDestroy(): void {

    if (this.weatherTimer) {
      clearInterval(this.weatherTimer);
    }

    if (this.map) {
      this.map.remove();
    }

  }

  private initializeMap(): void {

    /*
     * Ask browser for notification permission.
     *
     * This allows AquaSentinel to show a browser
     * notification when risk crosses above 70.
     */
    this.alertService.requestNotificationPermission();

    this.map = L.map(
      'riskMap',
      {
        center: [30.39, 79.04],
        zoom: 10,
        zoomControl: false,
        attributionControl: true
      }
    );

    this.streetLayer =
      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
        }
      );

    this.terrainLayer =
      L.tileLayer(
        'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 17,
          attribution:
            'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap'
        }
      );

    this.streetLayer.addTo(this.map);

    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    this.riskLayer =
      L.layerGroup().addTo(this.map);

    this.weatherLayer =
      L.layerGroup().addTo(this.map);

    this.studyAreaLayer =
      L.layerGroup().addTo(this.map);

    this.addStudyArea();
    this.addRiskZones();

    /*
     * Rudraprayag is the default selected region.
     */
    this.selectZone('Rudraprayag');

    this.mapStatus = 'GIS ONLINE';

    this.loadAllWeather();

    /*
     * Refresh weather + ML risk every 5 minutes.
     */
    this.weatherTimer =
      setInterval(
        () => {
          this.loadAllWeather();
        },
        5 * 60 * 1000
      );

    setTimeout(() => {
      this.map.invalidateSize();
    }, 400);

  }

  private addStudyArea(): void {

    const polygon =
      L.polygon(
        [
          [30.57, 78.93],
          [30.58, 79.15],
          [30.42, 79.21],
          [30.24, 79.13],
          [30.20, 78.94],
          [30.30, 78.87],
          [30.48, 78.88]
        ],
        {
          color: '#69c7b1',
          weight: 1.5,
          opacity: 0.65,
          fillColor: '#69c7b1',
          fillOpacity: 0.035,
          dashArray: '8 8',
          interactive: false
        }
      );

    polygon.addTo(this.studyAreaLayer);

  }

  private addRiskZones(): void {

    this.zones.forEach(
      zone => {

        const color =
          this.getRiskColor(zone.risk);

        const pulse =
          L.circleMarker(
            [zone.lat, zone.lng],
            {
              radius: 20,
              color,
              weight: 1,
              opacity: 0.20,
              fillColor: color,
              fillOpacity: 0.07,
              interactive: false
            }
          );

        pulse.addTo(this.riskLayer);

        zone.pulse = pulse;

        const marker =
          L.circleMarker(
            [zone.lat, zone.lng],
            {
              radius: 10,
              color: '#ffffff',
              weight: 2,
              opacity: 1,
              fillColor: color,
              fillOpacity: 0.95
            }
          );

        marker.addTo(this.riskLayer);

        zone.marker = marker;

        marker.bindTooltip(
          this.buildTooltip(zone),
          {
            direction: 'top',
            offset: [0, -8],
            opacity: 0.97,
            className: 'aqua-tooltip'
          }
        );

        marker.on(
          'click',
          () => {
            this.selectZone(zone.name);
          }
        );

        marker.on(
          'mouseover',
          () => {
            marker.setRadius(14);
          }
        );

        marker.on(
          'mouseout',
          () => {

            if (
              this.selectedZone !== zone.name
            ) {
              marker.setRadius(10);
            }

          }
        );

      }
    );

  }

  private buildTooltip(
    zone: RiskZone
  ): string {

    return `
      <div class="gis-tooltip">
        <strong>${zone.name}</strong>
        <span>Risk ${zone.risk} · ${this.getRiskLabel(zone.risk)}</span>
        <span>${zone.weatherText}</span>
        <span>24h rainfall: ${zone.rainfall24h.toFixed(1)} mm</span>
        <span>ML confidence: ${zone.confidence}%</span>
        <span>Source: ${zone.predictionSource}</span>
      </div>
    `;

  }

  selectZone(name: string): void {

    const zone =
      this.zones.find(
        item => item.name === name
      );

    if (!zone || !this.map) {
      return;
    }

    this.selectedZone = zone.name;

    this.alertReviewed = false;

    this.zones.forEach(
      item => {

        if (!item.marker) {
          return;
        }

        const selected =
          item.name === name;

        item.marker.setRadius(
          selected ? 15 : 10
        );

        item.marker.setStyle(
          {
            weight:
              selected ? 4 : 2,

            color:
              selected
                ? '#dce8c9'
                : '#ffffff',

            fillColor:
              this.getRiskColor(
                item.risk
              )
          }
        );

        if (item.pulse) {

          item.pulse.setRadius(
            selected ? 29 : 20
          );

          item.pulse.setStyle(
            {
              opacity:
                selected
                  ? 0.60
                  : 0.20,

              fillOpacity:
                selected
                  ? 0.14
                  : 0.07
            }
          );

        }

      }
    );

    this.map.flyTo(
      [zone.lat, zone.lng],
      12,
      {
        animate: true,
        duration: 0.8
      }
    );

    this.updateSelectedWeather(zone);

    this.updateForecastForSelectedZone();

  }

  async loadAllWeather(): Promise<void> {

    this.weatherStatus = 'UPDATING';

    try {

      await Promise.all(
        this.zones.map(
          zone =>
            this.loadWeather(zone)
        )
      );

      this.refreshMarkers();

      this.updateWeatherOverlay();

      const selected =
        this.zones.find(
          zone =>
            zone.name ===
            this.selectedZone
        );

      if (selected) {

        this.updateSelectedWeather(
          selected
        );

        this.updateForecastForSelectedZone();

      }

      this.lastUpdated =
        new Date().toLocaleTimeString(
          'en-IN',
          {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }
        );

      this.weatherStatus = 'LIVE';

    } catch (error) {

      console.error(
        'Weather update failed:',
        error
      );

      this.weatherStatus = 'OFFLINE';

      this.zones.forEach(
        zone => {
          zone.confidence = 55;
          zone.predictionSource = 'OFFLINE';
        }
      );

    }

  }

  private async loadWeather(
    zone: RiskZone
  ): Promise<void> {

    const url =
      'https://api.open-meteo.com/v1/forecast' +
      `?latitude=${zone.lat}` +
      `&longitude=${zone.lng}` +
      '&current=' +
      [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation',
        'wind_speed_10m',
        'wind_gusts_10m',
        'weather_code',
        'soil_moisture_0_to_1cm'
      ].join(',') +
      '&hourly=' +
      [
        'temperature_2m',
        'precipitation',
        'precipitation_probability',
        'relative_humidity_2m',
        'soil_moisture_0_to_1cm',
        'weather_code'
      ].join(',') +
      '&past_hours=24' +
      '&forecast_hours=24' +
      '&timezone=Asia%2FKolkata';

    const response =
      await fetch(url);

    if (!response.ok) {

      throw new Error(
        `Weather request failed for ${zone.name}`
      );

    }

    const data =
      await response.json();

    const current =
      data.current;

    zone.temperature =
      this.safeNumber(
        current?.temperature_2m
      );

    zone.humidity =
      this.safeNumber(
        current?.relative_humidity_2m
      );

    zone.rainfall =
      this.safeNumber(
        current?.precipitation
      ) ?? 0;

    zone.windSpeed =
      this.safeNumber(
        current?.wind_speed_10m
      );

    zone.windGust =
      this.safeNumber(
        current?.wind_gusts_10m
      );

    zone.soilMoisture =
      this.safeNumber(
        current?.soil_moisture_0_to_1cm
      );

    zone.weatherCode =
      this.safeNumber(
        current?.weather_code
      );

    zone.weatherText =
      this.getWeatherDescription(
        zone.weatherCode
      );

    const apiElevation =
      this.safeNumber(
        data?.elevation
      );

    if (apiElevation !== null) {
      zone.elevation = apiElevation;
    }

    const hourly =
      data.hourly;

    const times: string[] =
      hourly?.time ?? [];

    const rainfall: number[] =
      hourly?.precipitation ?? [];

    const temperatures: number[] =
      hourly?.temperature_2m ?? [];

    const probabilities: number[] =
      hourly?.precipitation_probability ?? [];

    const currentIndex =
      Math.max(
        0,
        times.length - 25
      );

    const historyStart =
      Math.max(
        0,
        currentIndex - 24
      );

    const historyValues =
      rainfall.slice(
        historyStart,
        currentIndex + 1
      );

    zone.rainfall24h =
      historyValues.reduce(
        (
          total: number,
          value: number
        ) =>
          total +
          (Number(value) || 0),
        0
      );

    const futureStart =
      Math.min(
        currentIndex + 1,
        times.length
      );

    const futureValues =
      rainfall.slice(
        futureStart,
        futureStart + 6
      );

    zone.forecast6hRainfall =
      futureValues.reduce(
        (
          total: number,
          value: number
        ) =>
          total +
          (Number(value) || 0),
        0
      );

    await this.updateRiskFromApi(zone);

    if (
      zone.name ===
      this.selectedZone
    ) {

      this.rainfallHistory =
        times
          .slice(
            historyStart,
            currentIndex + 1
          )
          .map(
            (
              time: string,
              index: number
            ) => ({
              time:
                this.formatHour(time),

              rainfall:
                Number(
                  rainfall[
                    historyStart +
                    index
                  ] || 0
                )
            })
          );

      this.forecast =
        times
          .slice(
            futureStart,
            futureStart + 6
          )
          .map(
            (
              time: string,
              index: number
            ) => {

              const actualIndex =
                futureStart + index;

              return {
                time:
                  this.formatHour(time),

                rainfall:
                  Number(
                    rainfall[
                      actualIndex
                    ] || 0
                  ),

                temperature:
                  this.safeNumber(
                    temperatures[
                      actualIndex
                    ]
                  ),

                probability:
                  this.safeNumber(
                    probabilities[
                      actualIndex
                    ]
                  ),

                risk:
                  this.calculateForecastRisk(
                    zone,
                    rainfall[
                      actualIndex
                    ] || 0
                  )
              };

            }
          );

    }

  }

  private updateRiskFromApi(
    zone: RiskZone
  ): Promise<void> {

    return new Promise(
      resolve => {

        const request = {
          latitude: zone.lat,
          longitude: zone.lng,
          elevation: zone.elevation,
          slope: zone.slope,
          rainfall: zone.rainfall24h,
          aspect: zone.aspect,
          month: new Date().getMonth() + 1
        };

        this.riskApi
          .predictRisk(request)
          .subscribe({

            next: response => {

              zone.risk =
                Math.max(
                  0,
                  Math.min(
                    100,
                    Math.round(
                      response.flood_probability * 100
                    )
                  )
                );

              zone.confidence =
                Math.max(
                  0,
                  Math.min(
                    100,
                    Math.round(
                      response.confidence_pct
                    )
                  )
                );

              zone.predictionSource =
                response.prediction_source ||
                'API';

              /*
               * IMPORTANT:
               * Check the new ML risk immediately.
               *
               * If risk > 70:
               *     AlertService creates alert
               *     Browser notification appears
               *
               * If risk <= 70:
               *     Alert lock is reset
               */
              this.handleAutomaticAlert(zone);

              resolve();

            },

            error: error => {

              console.error(
                `ML prediction failed for ${zone.name}:`,
                error
              );

              this.calculateDynamicRisk(zone);

              zone.predictionSource =
                'LOCAL FALLBACK';

              /*
               * Also check automatic alert
               * when using fallback risk.
               */
              this.handleAutomaticAlert(zone);

              resolve();

            }

          });

      }
    );

  }

  /**
   * ============================================
   * AUTOMATIC ALERT SYSTEM
   * ============================================
   *
   * The threshold itself comes from AlertService.
   *
   * Risk <= 70
   *       ↓
   * No notification
   *
   * Risk > 70
   *       ↓
   * AlertService
   *       ↓
   * Automatic alert
   *       ↓
   * Browser notification
   */

  private handleAutomaticAlert(
    zone: RiskZone
  ): void {

    const risk =
      Math.round(zone.risk);

    const threshold =
      this.alertService.getAlertThreshold();

    /*
     * Risk is 70 or below.
     * Reset the zone so it can trigger again
     * if it later crosses above 70.
     */
    if (risk <= threshold) {

      this.alertService.resetZoneAlert(
        zone.name
      );

      return;
    }

    /*
     * Risk is ABOVE 70.
     *
     * AlertService will prevent duplicate alerts.
     */
    const alert =
      this.alertService.createAutomaticAlert(
        'Mandakini Micro-Catchment, Rudraprayag',
        zone.name,
        risk,
        this.getAutomaticAlertAction(risk)
      );

    /*
     * Alert was successfully generated.
     */
    if (alert) {

      console.warn(
        `🚨 AQUASENTINEL AUTOMATIC ALERT: ` +
        `${zone.name} risk ${risk}`
      );

      /*
       * If the selected zone triggered the alert,
       * reset the review state.
       */
      if (
        zone.name ===
        this.selectedZone
      ) {

        this.alertReviewed = false;

      }

    }

  }

  /**
   * Action included with automatic alert.
   */
  private getAutomaticAlertAction(
    risk: number
  ): string {

    if (risk >= 81) {

      return (
        'Immediate field verification and ' +
        'evacuation readiness'
      );

    }

    return (
      'Inspect vulnerable roads and prepare ' +
      'local response teams'
    );

  }

  private calculateDynamicRisk(
    zone: RiskZone
  ): void {

    const rainFactor =
      Math.min(
        100,
        (
          zone.rainfall24h * 1.4
        ) +
        (
          zone.rainfall * 6
        ) +
        (
          zone.forecast6hRainfall * 1.0
        )
      );

    const soilFactor =
      zone.soilMoisture === null
        ? 45
        : Math.min(
            100,
            zone.soilMoisture * 220
          );

    const slopeFactor =
      Math.min(
        100,
        (
          zone.slope / 45
        ) * 100
      );

    const drainageFactor =
      Math.min(
        100,
        zone.drainage
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

    const liveAdjustment =
      (
        composite - 50
      ) * 0.65;

    zone.risk =
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            zone.baseRisk +
            liveAdjustment
          )
        )
      );

    zone.confidence =
      this.calculateConfidence(zone);

  }

  private calculateForecastRisk(
    zone: RiskZone,
    forecastRain: number
  ): number {

    const projectedRain =
      zone.rainfall24h +
      (
        zone.forecast6hRainfall +
        forecastRain
      );

    const rainFactor =
      Math.min(
        100,
        projectedRain * 1.5
      );

    const soilFactor =
      zone.soilMoisture === null
        ? 45
        : Math.min(
            100,
            zone.soilMoisture * 220
          );

    const slopeFactor =
      Math.min(
        100,
        (
          zone.slope / 45
        ) * 100
      );

    const drainageFactor =
      zone.drainage;

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

    return Math.max(
      0,
      Math.min(
        100,
        Math.round(
          zone.baseRisk +
          (
            composite - 50
          ) * 0.65
        )
      )
    );

  }

  private calculateConfidence(
    zone: RiskZone
  ): number {

    let confidence = 70;

    if (
      zone.temperature !== null &&
      zone.humidity !== null &&
      zone.soilMoisture !== null
    ) {
      confidence += 15;
    }

    if (
      zone.rainfall24h >= 0
    ) {
      confidence += 10;
    }

    if (
      zone.slope > 0 &&
      zone.drainage > 0
    ) {
      confidence += 5;
    }

    return Math.min(
      100,
      confidence
    );

  }

  private refreshMarkers(): void {

    this.zones.forEach(
      zone => {

        if (!zone.marker) {
          return;
        }

        const color =
          this.getRiskColor(
            zone.risk
          );

        zone.marker.setStyle(
          {
            fillColor: color,

            color:
              zone.name ===
              this.selectedZone
                ? '#dce8c9'
                : '#ffffff'
          }
        );

        zone.marker.setTooltipContent(
          this.buildTooltip(zone)
        );

        if (zone.pulse) {

          zone.pulse.setStyle(
            {
              color,
              fillColor: color
            }
          );

        }

      }
    );

  }

  private updateWeatherOverlay(): void {

    this.weatherLayer.clearLayers();

    if (!this.showWeatherLayer) {
      return;
    }

    this.zones.forEach(
      zone => {

        const intensity =
          Math.min(
            1,
            (
              zone.rainfall24h +
              zone.forecast6hRainfall
            ) / 60
          );

        const color =
          intensity > 0.70
            ? '#e05252'
            : intensity > 0.40
              ? '#e09a45'
              : intensity > 0.15
                ? '#c7b84c'
                : '#4da88f';

        const radius =
          900 +
          (
            intensity * 2200
          );

        const circle =
          L.circle(
            [zone.lat, zone.lng],
            {
              radius,
              color,
              weight: 1,
              opacity: 0.25,
              fillColor: color,
              fillOpacity:
                0.06 +
                intensity * 0.12,
              interactive: false
            }
          );

        circle.addTo(
          this.weatherLayer
        );

        zone.weatherCircle =
          circle;

      }
    );

  }

  updateBaseMap(
    type: 'street' | 'terrain'
  ): void {

    if (!this.map) {
      return;
    }

    this.activeBaseMap = type;

    if (type === 'street') {

      if (
        this.map.hasLayer(
          this.terrainLayer
        )
      ) {

        this.map.removeLayer(
          this.terrainLayer
        );

      }

      if (
        !this.map.hasLayer(
          this.streetLayer
        )
      ) {

        this.streetLayer.addTo(
          this.map
        );

      }

    } else {

      if (
        this.map.hasLayer(
          this.streetLayer
        )
      ) {

        this.map.removeLayer(
          this.streetLayer
        );

      }

      if (
        !this.map.hasLayer(
          this.terrainLayer
        )
      ) {

        this.terrainLayer.addTo(
          this.map
        );

      }

    }

  }

  toggleWeatherLayer(): void {

    this.showWeatherLayer =
      !this.showWeatherLayer;

    if (this.showWeatherLayer) {

      this.weatherLayer.addTo(
        this.map
      );

      this.updateWeatherOverlay();

    } else {

      this.map.removeLayer(
        this.weatherLayer
      );

    }

  }

  toggleRiskLayer(): void {

    this.showRiskLayer =
      !this.showRiskLayer;

    if (this.showRiskLayer) {

      this.riskLayer.addTo(
        this.map
      );

    } else {

      this.map.removeLayer(
        this.riskLayer
      );

    }

  }

  toggleStudyArea(): void {

    this.showStudyArea =
      !this.showStudyArea;

    if (this.showStudyArea) {

      this.studyAreaLayer.addTo(
        this.map
      );

    } else {

      this.map.removeLayer(
        this.studyAreaLayer
      );

    }

  }

  private updateSelectedWeather(
    zone: RiskZone
  ): void {

    this.selectedWeather = {

      temperature:
        zone.temperature,

      humidity:
        zone.humidity,

      rainfall:
        zone.rainfall,

      windSpeed:
        zone.windSpeed,

      windGust:
        zone.windGust,

      soilMoisture:
        zone.soilMoisture,

      weatherText:
        zone.weatherText,

      weatherCode:
        zone.weatherCode

    };

  }

  private updateForecastForSelectedZone(): void {

    const selected =
      this.zones.find(
        zone =>
          zone.name ===
          this.selectedZone
      );

    if (!selected) {
      return;
    }

    // Forecast is populated by loadWeather().

  }

  getRiskColor(
    risk: number
  ): string {

    if (risk >= 81) {
      return '#e05252';
    }

    if (risk >= 61) {
      return '#e09a45';
    }

    if (risk >= 31) {
      return '#c7b84c';
    }

    return '#4da88f';

  }

  getRiskLabel(
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

  getTrendClass(
    current: number,
    future: number
  ): string {

    if (future > current + 3) {
      return 'rising';
    }

    if (future < current - 3) {
      return 'falling';
    }

    return 'stable';

  }

  getTrendIcon(
    current: number,
    future: number
  ): string {

    if (future > current + 3) {
      return '↗';
    }

    if (future < current - 3) {
      return '↘';
    }

    return '→';

  }

  getRiskBarWidth(
    risk: number
  ): number {

    return Math.min(
      100,
      Math.max(
        0,
        risk
      )
    );

  }

  getRainfallWidth(): number {

    return Math.min(
      100,
      (
        this.selectedWeather.rainfall ||
        0
      ) * 10
    );

  }

  getRainfall24Width(): number {

    const zone =
      this.selectedZoneData;

    if (!zone) {
      return 0;
    }

    return Math.min(
      100,
      zone.rainfall24h * 1.5
    );

  }

  getHumidityWidth(): number {

    return Math.min(
      100,
      this.selectedWeather.humidity || 0
    );

  }

  getSoilMoistureWidth(): number {

    const value =
      this.selectedWeather.soilMoisture;

    if (value === null) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        value * 100
      )
    );

  }

  get soilMoisturePercentage(): number {

    const value =
      this.selectedWeather.soilMoisture;

    if (value === null) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        value * 100
      )
    );

  }

  get maxRainfallHistory(): number {

    if (
      !this.rainfallHistory.length
    ) {
      return 1;
    }

    return Math.max(
      1,
      ...this.rainfallHistory.map(
        item => item.rainfall
      )
    );

  }

  get maxForecastRainfall(): number {

    if (!this.forecast.length) {
      return 1;
    }

    return Math.max(
      1,
      ...this.forecast.map(
        item => item.rainfall
      )
    );

  }

  get selectedZoneData():
    RiskZone | undefined {

    return this.zones.find(
      zone =>
        zone.name ===
        this.selectedZone
    );

  }

  get futureRisk(): number {

    if (!this.forecast.length) {
      return this.selectedZoneData?.risk || 0;
    }

    return this.forecast[
      this.forecast.length - 1
    ].risk;

  }

  get riskTrend(): string {

    const current =
      this.selectedZoneData?.risk || 0;

    return this.getTrendClass(
      current,
      this.futureRisk
    );

  }

  get riskTrendIcon(): string {

    const current =
      this.selectedZoneData?.risk || 0;

    return this.getTrendIcon(
      current,
      this.futureRisk
    );

  }

  get riskTrendText(): string {

    if (this.riskTrend === 'rising') {
      return 'RISK INCREASING';
    }

    if (this.riskTrend === 'falling') {
      return 'RISK DECREASING';
    }

    return 'RISK STABLE';

  }

  get primaryRiskFactor(): string {

    const zone =
      this.selectedZoneData;

    if (!zone) {
      return '--';
    }

    const rainfall =
      zone.rainfall24h;

    const soil =
      zone.soilMoisture || 0;

    if (
      rainfall >= 35 &&
      rainfall >= soil * 80
    ) {
      return 'Heavy rainfall';
    }

    if (soil >= 0.35) {
      return 'High soil wetness';
    }

    if (zone.slope >= 38) {
      return 'Steep terrain';
    }

    if (zone.drainage >= 80) {
      return 'Drainage exposure';
    }

    return 'Combined terrain + weather';

  }

  get secondaryRiskFactor(): string {

    const zone =
      this.selectedZoneData;

    if (!zone) {
      return '--';
    }

    if (
      zone.slope >= 38
    ) {
      return 'Steep terrain';
    }

    if (
      zone.drainage >= 75
    ) {
      return 'Drainage exposure';
    }

    if (
      zone.historicalEvents >= 6
    ) {
      return 'Historical event exposure';
    }

    return 'Antecedent wetness';

  }

  /*
   * ============================================
   * DECISION SUPPORT
   * ============================================
   */

  get riskExplanation(): string {

    const zone =
      this.selectedZoneData;

    if (!zone) {
      return 'Waiting for regional risk data.';
    }

    const risk =
      zone.risk;

    const rainfall =
      zone.rainfall24h;

    const soil =
      zone.soilMoisture ?? 0;

    const slope =
      zone.slope;

    const trend =
      this.riskTrend;

    if (risk >= 81) {

      if (
        rainfall >= 35 &&
        soil >= 0.35
      ) {
        return 'High rainfall combined with elevated soil wetness is increasing flood susceptibility. Terrain conditions may amplify runoff and reduce available response time.';
      }

      if (slope >= 38) {
        return 'Steep terrain is significantly increasing susceptibility. Additional rainfall may rapidly increase runoff and localized hazard exposure.';
      }

      return 'Multiple environmental signals indicate elevated hazard susceptibility. Continued monitoring and rapid coordination are recommended.';

    }

    if (risk >= 61) {

      if (
        rainfall >= 20 &&
        soil >= 0.30
      ) {
        return 'Recent rainfall and elevated soil wetness are increasing regional susceptibility. Additional precipitation could push conditions toward a higher-risk state.';
      }

      if (slope >= 38) {
        return 'Terrain susceptibility is a major contributor to the current risk level, with steep slopes increasing sensitivity to additional rainfall.';
      }

      return 'Combined terrain and weather conditions are producing elevated risk. Monitoring should remain active as conditions evolve.';

    }

    if (risk >= 31) {

      if (soil >= 0.35) {
        return 'Antecedent wetness is increasing regional sensitivity. Current rainfall is limited, but additional precipitation could increase runoff and hazard potential.';
      }

      if (rainfall >= 10) {
        return 'Recent rainfall is contributing to a moderate risk state. Monitor precipitation trends and regional conditions for further increases.';
      }

      if (slope >= 30) {
        return 'Terrain susceptibility is contributing to the current moderate risk. Additional rainfall could increase localized runoff and exposure.';
      }

      if (trend === 'rising') {
        return 'Risk is currently moderate and trending upward. Changing weather conditions may increase regional susceptibility over the next few hours.';
      }

      return 'Combined terrain and weather signals indicate moderate susceptibility. Continued monitoring is appropriate.';

    }

    return 'Current environmental conditions indicate relatively low hazard susceptibility. Continue routine monitoring for significant weather changes.';

  }

  get recommendedAction(): string {

    const zone =
      this.selectedZoneData;

    if (!zone) {
      return 'Awaiting sufficient data before recommending an operational response.';
    }

    const risk =
      zone.risk;

    const rainfall =
      zone.rainfall24h;

    const soil =
      zone.soilMoisture ?? 0;

    const trend =
      this.riskTrend;

    if (risk >= 81) {

      return 'Initiate enhanced monitoring and notify the responsible disaster-management team. Review exposed roads and settlements and prepare escalation if conditions deteriorate.';

    }

    if (risk >= 61) {

      return 'Maintain enhanced monitoring, review nearby road and settlement exposure, and keep local response teams informed. Escalate if rainfall or risk continues to increase.';

    }

    if (risk >= 31) {

      if (
        trend === 'rising' ||
        soil >= 0.35 ||
        rainfall >= 10
      ) {

        return 'Continue enhanced monitoring and review local road conditions. Keep response teams informed and reassess if rainfall intensity increases.';

      }

      return 'Continue routine monitoring and reassess the region if rainfall, soil wetness, or terrain-related indicators increase.';

    }

    return 'Maintain routine monitoring. No immediate escalation is indicated by the current risk estimate.';

  }

  get escalationLevel(): string {

    const zone =
      this.selectedZoneData;

    if (!zone) {
      return 'PENDING';
    }

    if (zone.risk >= 81) {
      return 'HIGH ESCALATION';
    }

    if (zone.risk >= 61) {
      return 'ENHANCED MONITORING';
    }

    if (zone.risk >= 31) {
      return 'WATCH';
    }

    return 'ROUTINE';

  }

  formatValue(
    value: number | null,
    suffix = ''
  ): string {

    if (
      value === null ||
      value === undefined
    ) {
      return '--';
    }

    return `${value}${suffix}`;

  }

  formatPopulation(
    value: number
  ): string {

    if (value >= 1000) {

      return (
        (
          value / 1000
        ).toFixed(1)
      ) + 'k';

    }

    return value.toString();

  }

  formatHour(
    value: string
  ): string {

    if (!value) {
      return '--';
    }

    const parts =
      value.split('T');

    if (
      parts.length < 2
    ) {
      return value;
    }

    return parts[1].slice(
      0,
      5
    );

  }

  reviewAlert(): void {

    const zone =
      this.selectedZoneData;

    if (!zone) {
      return;
    }

    this.alertReviewed = true;

  }

  getWeatherDescription(
    code: number | null
  ): string {

    if (code === null) {
      return 'Weather unavailable';
    }

    if (code === 0) {
      return 'Clear sky';
    }

    if (
      [1, 2, 3].includes(code)
    ) {
      return 'Partly cloudy';
    }

    if (
      [45, 48].includes(code)
    ) {
      return 'Fog / reduced visibility';
    }

    if (
      [51, 53, 55].includes(code)
    ) {
      return 'Drizzle';
    }

    if (
      [56, 57].includes(code)
    ) {
      return 'Freezing drizzle';
    }

    if (
      [61, 63, 65].includes(code)
    ) {
      return 'Rain';
    }

    if (
      [66, 67].includes(code)
    ) {
      return 'Freezing rain';
    }

    if (
      [71, 73, 75, 77].includes(code)
    ) {
      return 'Snow';
    }

    if (
      [80, 81, 82].includes(code)
    ) {
      return 'Rain showers';
    }

    if (
      [85, 86].includes(code)
    ) {
      return 'Snow showers';
    }

    if (code === 95) {
      return 'Thunderstorm';
    }

    if (
      [96, 99].includes(code)
    ) {
      return 'Thunderstorm + hail';
    }

    return 'Variable conditions';

  }

  private safeNumber(
    value: any
  ): number | null {

    if (
      value === null ||
      value === undefined ||
      Number.isNaN(
        Number(value)
      )
    ) {
      return null;
    }

    return Number(value);

  }

}