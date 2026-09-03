import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-replay',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './replay.html',
  styleUrl: './replay.css'
})
export class Replay {

  rainfall = 32;
  soilWetness = 42;
  riskScore = 38;
  currentHour = 8;

  replay() {
    this.currentHour++;

    this.rainfall += 12;
    this.soilWetness += 8;
    this.riskScore += 9;

    if (this.rainfall > 100) this.rainfall = 100;
    if (this.soilWetness > 100) this.soilWetness = 100;
    if (this.riskScore > 100) this.riskScore = 100;
  }

  reset() {
    this.rainfall = 32;
    this.soilWetness = 42;
    this.riskScore = 38;
    this.currentHour = 8;
  }

  getRiskLevel(): string {
    if (this.riskScore >= 80) return 'CRITICAL';
    if (this.riskScore >= 61) return 'HIGH';
    if (this.riskScore >= 31) return 'MODERATE';
    return 'LOW';
  }
}