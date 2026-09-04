import {
  Component,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface HistoricalWeather {
  time: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  rain: number;
  windSpeed: number;
  windGust: number;
  soilMoisture: number;
  weatherCode: number;
  riskScore: number;
}

@Component({
  selector: 'app-replay',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './replay.html',
  styleUrl: './replay.css'
})
export class Replay implements OnInit {

  constructor(
    private cdr: ChangeDetectorRef
  ) {}

  // =====================================================
  // LOCATION
  // =====================================================

  latitude = 30.2844;
  longitude = 78.9811;


  // =====================================================
  // SELECTED HISTORICAL EVENT
  // =====================================================

  selectedDate = '2013-06-16';


  historicalEvents = [

    {
      date: '2013-06-16',
      title: 'June 2013 Uttarakhand Extreme Rainfall',
      description:
        'Historical weather replay for the Mandakini catchment'
    },

    {
      date: '2013-06-17',
      title: 'June 2013 Uttarakhand Rainfall – Day 2',
      description:
        'Continuation of the historical weather sequence'
    },

    {
      date: '2021-10-18',
      title: 'October 2021 Uttarakhand Heavy Rainfall',
      description:
        'Historical rainfall replay'
    }

  ];


  // =====================================================
  // WEATHER DATA
  // =====================================================

  weatherData: HistoricalWeather[] = [];

  currentIndex = 0;


  // =====================================================
  // UI STATE
  // =====================================================

  loading = false;

  errorMessage = '';

  currentHour = '--';


  // =====================================================
  // CURRENT WEATHER VALUES
  // =====================================================

  rainfall = 0;

  soilWetness = 0;

  riskScore = 0;

  temperature = 0;

  humidity = 0;

  windSpeed = 0;

  windGust = 0;

  precipitation = 0;

  weatherCondition = 'No data';


  // =====================================================
  // DAY SUMMARY
  // =====================================================

  totalRainfall = 0;

  maxHourlyRainfall = 0;


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  ngOnInit(): void {

    this.loadHistoricalWeather();

  }


  // =====================================================
  // SELECT HISTORICAL EVENT
  // =====================================================

  selectHistoricalEvent(date: string): void {

    this.selectedDate = date;

    this.currentIndex = 0;

    this.weatherData = [];

    this.errorMessage = '';

    this.loading = true;

    this.cdr.detectChanges();

    this.loadHistoricalWeather();

  }


  // =====================================================
  // LOAD HISTORICAL WEATHER
  // =====================================================

  async loadHistoricalWeather(): Promise<void> {

    this.loading = true;

    this.errorMessage = '';

    /*
     * Clear old data while loading.
     */

    this.weatherData = [];

    this.cdr.detectChanges();


    try {

      const url =
        `https://archive-api.open-meteo.com/v1/archive` +
        `?latitude=${this.latitude}` +
        `&longitude=${this.longitude}` +
        `&start_date=${this.selectedDate}` +
        `&end_date=${this.selectedDate}` +
        `&hourly=` +
        `temperature_2m,` +
        `relative_humidity_2m,` +
        `precipitation,` +
        `rain,` +
        `weather_code,` +
        `wind_speed_10m,` +
        `wind_gusts_10m` +
        `&timezone=Asia%2FKolkata` +
        `&temperature_unit=celsius` +
        `&wind_speed_unit=kmh` +
        `&precipitation_unit=mm`;


      console.log(
        'AquaSentinel historical API request:'
      );

      console.log(url);


      /*
       * 15 second timeout.
       */

      const controller =
        new AbortController();


      const timeout =
        setTimeout(() => {

          controller.abort();

        }, 15000);


      let response: Response;


      try {

        response =
          await fetch(
            url,
            {
              method: 'GET',
              signal: controller.signal
            }
          );

      } finally {

        clearTimeout(timeout);

      }


      if (!response.ok) {

        throw new Error(
          `Historical API returned HTTP ${response.status}`
        );

      }


      const data =
        await response.json();


      console.log(
        'AquaSentinel historical weather response:',
        data
      );


      /*
       * Validate response.
       */

      if (
        !data ||
        !data.hourly ||
        !Array.isArray(data.hourly.time)
      ) {

        throw new Error(
          'Historical API returned no hourly data.'
        );

      }


      const hourly = data.hourly;


      /*
       * Convert API response into our
       * AquaSentinel weather structure.
       */

      this.weatherData =
        hourly.time.map(
          (time: string, index: number) => {

            const temperature =
              Number(
                hourly.temperature_2m?.[index] ?? 0
              );


            const humidity =
              Number(
                hourly.relative_humidity_2m?.[index] ?? 0
              );


            const precipitation =
              Number(
                hourly.precipitation?.[index] ?? 0
              );


            const rain =
              Number(
                hourly.rain?.[index] ??
                precipitation
              );


            const windSpeed =
              Number(
                hourly.wind_speed_10m?.[index] ?? 0
              );


            const windGust =
              Number(
                hourly.wind_gusts_10m?.[index] ?? 0
              );


            const weatherCode =
              Number(
                hourly.weather_code?.[index] ?? 0
              );


            /*
             * Derived wetness indicator.
             *
             * This is NOT presented as a direct
             * historical sensor measurement.
             */

            const soilMoisture =
              this.estimateSoilWetness(
                humidity,
                precipitation
              );


            const riskScore =
              this.calculateHistoricalRisk(
                precipitation,
                humidity,
                soilMoisture,
                windSpeed
              );


            return {

              time,

              temperature,

              humidity,

              precipitation,

              rain,

              windSpeed,

              windGust,

              soilMoisture,

              weatherCode,

              riskScore

            };

          }
        );


      /*
       * Make sure data exists.
       */

      if (
        !this.weatherData.length
      ) {

        throw new Error(
          'No hourly weather records were returned.'
        );

      }


      /*
       * Calculate daily rainfall.
       */

      this.totalRainfall =
        this.weatherData.reduce(
          (
            total,
            item
          ) =>
            total +
            item.precipitation,
          0
        );


      /*
       * Maximum hourly rainfall.
       */

      this.maxHourlyRainfall =
        Math.max(
          ...this.weatherData.map(
            item =>
              item.precipitation
          )
        );


      /*
       * Start at midnight.
       */

      this.currentIndex = 0;


      /*
       * Update displayed values.
       */

      this.updateDisplayedWeather();


      /*
       * IMPORTANT:
       * Force Angular to update the screen.
       */

      this.cdr.detectChanges();


      console.log(
        'AquaSentinel replay loaded:',
        this.weatherData.length,
        'hourly records'
      );


    } catch (error: any) {

      console.error(
        'AquaSentinel historical weather error:',
        error
      );


      if (
        error?.name === 'AbortError'
      ) {

        this.errorMessage =
          'Historical weather request timed out. Please try again.';

      } else {

        this.errorMessage =
          'Unable to load historical weather data. Please check your internet connection.';

      }


      this.weatherData = [];


      /*
       * Update error message immediately.
       */

      this.cdr.detectChanges();


    } finally {

      /*
       * NEVER leave loading stuck.
       */

      this.loading = false;


      this.cdr.detectChanges();

    }

  }


  // =====================================================
  // ESTIMATE SOIL WETNESS
  // =====================================================

  private estimateSoilWetness(
    humidity: number,
    rainfall: number
  ): number {

    const humidityContribution =
      Math.max(
        0,
        Math.min(
          70,
          (humidity - 40) * 1.4
        )
      );


    const rainfallContribution =
      Math.min(
        30,
        rainfall * 10
      );


    return Math.round(
      Math.min(
        100,
        humidityContribution +
        rainfallContribution
      )
    );

  }


  // =====================================================
  // NEXT HOUR
  // =====================================================

  replay(): void {

    if (
      !this.weatherData.length
    ) {

      return;

    }


    if (
      this.currentIndex <
      this.weatherData.length - 1
    ) {

      this.currentIndex++;

      this.updateDisplayedWeather();

      this.cdr.detectChanges();

    }

  }


  // =====================================================
  // PREVIOUS HOUR
  // =====================================================

  previousHour(): void {

    if (
      !this.weatherData.length
    ) {

      return;

    }


    if (
      this.currentIndex > 0
    ) {

      this.currentIndex--;

      this.updateDisplayedWeather();

      this.cdr.detectChanges();

    }

  }


  // =====================================================
  // RESET
  // =====================================================

  reset(): void {

    if (
      !this.weatherData.length
    ) {

      return;

    }


    this.currentIndex = 0;

    this.updateDisplayedWeather();

    this.cdr.detectChanges();

  }


  // =====================================================
  // AUTOMATIC REPLAY
  // =====================================================

  replayAll(): void {

    if (
      !this.weatherData.length
    ) {

      return;

    }


    const interval =
      setInterval(
        () => {

          if (
            this.currentIndex >=
            this.weatherData.length - 1
          ) {

            clearInterval(interval);

            return;

          }


          this.currentIndex++;

          this.updateDisplayedWeather();

          this.cdr.detectChanges();

        },

        1200
      );

  }


  // =====================================================
  // UPDATE CURRENT DISPLAY
  // =====================================================

  private updateDisplayedWeather(): void {

    const weather =
      this.weatherData[
        this.currentIndex
      ];


    if (!weather) {

      return;

    }


    const date =
      new Date(weather.time);


    this.currentHour =
      date.toLocaleTimeString(
        'en-IN',
        {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }
      );


    this.temperature =
      Number(
        weather.temperature.toFixed(1)
      );


    this.humidity =
      Math.round(
        weather.humidity
      );


    this.rainfall =
      Number(
        weather.rain.toFixed(1)
      );


    this.precipitation =
      Number(
        weather.precipitation.toFixed(1)
      );


    this.windSpeed =
      Number(
        weather.windSpeed.toFixed(1)
      );


    this.windGust =
      Number(
        weather.windGust.toFixed(1)
      );


    this.soilWetness =
      Math.round(
        weather.soilMoisture
      );


    this.riskScore =
      Math.round(
        weather.riskScore
      );


    this.weatherCondition =
      this.getWeatherCondition(
        weather.weatherCode
      );

  }


  // =====================================================
  // HISTORICAL RISK ENGINE
  // =====================================================

  private calculateHistoricalRisk(
    rainfall: number,
    humidity: number,
    soilMoisture: number,
    windSpeed: number
  ): number {

    /*
     * Replay risk model:
     *
     * Rainfall      45%
     * Soil wetness  30%
     * Humidity      15%
     * Wind          10%
     */

    const rainfallScore =
      Math.min(
        100,
        rainfall * 8
      );


    const soilScore =
      Math.min(
        100,
        soilMoisture
      );


    const humidityScore =
      Math.min(
        100,
        Math.max(
          0,
          (humidity - 40) * 1.67
        )
      );


    const windScore =
      Math.min(
        100,
        windSpeed * 2.5
      );


    const risk =
      rainfallScore * 0.45 +
      soilScore * 0.30 +
      humidityScore * 0.15 +
      windScore * 0.10;


    return Math.round(
      Math.min(
        100,
        Math.max(
          0,
          risk
        )
      )
    );

  }


  // =====================================================
  // WEATHER CONDITION
  // =====================================================

  private getWeatherCondition(
    code: number
  ): string {

    if (code === 0) {
      return 'Clear sky';
    }


    if (
      [1, 2, 3].includes(code)
    ) {
      return 'Cloudy';
    }


    if (
      [45, 48].includes(code)
    ) {
      return 'Fog';
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


    if (
      [95, 96, 99].includes(code)
    ) {
      return 'Thunderstorm';
    }


    return 'Unknown';

  }


  // =====================================================
  // RISK LEVEL
  // =====================================================

  getRiskLevel(): string {

    if (
      this.riskScore >= 81
    ) {

      return 'CRITICAL';

    }


    if (
      this.riskScore >= 61
    ) {

      return 'HIGH';

    }


    if (
      this.riskScore >= 31
    ) {

      return 'MODERATE';

    }


    return 'LOW';

  }


  // =====================================================
  // REPLAY PROGRESS
  // =====================================================

  get replayProgress(): number {

    if (
      !this.weatherData.length
    ) {

      return 0;

    }


    return (
      (
        (this.currentIndex + 1) /
        this.weatherData.length
      ) * 100
    );

  }


  // =====================================================
  // REPLAY FINISHED
  // =====================================================

  get isReplayFinished(): boolean {

    if (
      !this.weatherData.length
    ) {

      return false;

    }


    return (
      this.currentIndex >=
      this.weatherData.length - 1
    );

  }


  // =====================================================
  // EVENT TITLE
  // =====================================================

  get selectedEventTitle(): string {

    const event =
      this.historicalEvents.find(
        item =>
          item.date ===
          this.selectedDate
      );


    return (
      event?.title ||
      'Historical Weather Replay'
    );

  }

}