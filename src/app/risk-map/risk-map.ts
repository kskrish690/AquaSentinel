import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-risk-map',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './risk-map.html',
  styleUrl: './risk-map.css'
})
export class RiskMap {

  selectedZone = 'Mandakini Micro-Catchment';

  villages = [
    { name: 'Silli', risk: 82 },
    { name: 'Agastyamuni', risk: 67 },
    { name: 'Ukhimath', risk: 54 },
    { name: 'Rudraprayag', risk: 42 }
  ];

  selectZone(village: string) {
    this.selectedZone = village;
  }
}