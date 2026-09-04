import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FloodPredictionRequest {
  latitude: number;
  longitude: number;
  elevation: number;
  slope: number;
  rainfall: number;
  aspect: number;
  month: number;
}

export interface FloodPredictionResponse {
  flood_probability: number;
  confidence_pct: number;
  risk_level: string;
  predicted_flood: number;
  terrain_susceptibility: number;
  monsoon_season: boolean;
  top_factors: string[];
  prediction_source: string;
}

@Injectable({
  providedIn: 'root'
})
export class RiskApiService {

  private apiUrl = 'http://127.0.0.1:8000';

  constructor(
    private http: HttpClient
  ) {}

  predictRisk(
    data: FloodPredictionRequest
  ): Observable<FloodPredictionResponse> {

    return this.http.post<FloodPredictionResponse>(
      `${this.apiUrl}/predict`,
      data
    );
  }

  healthCheck(): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/health`
    );

  }

}