import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-data-analysis',
  standalone: true,
  imports: [RouterLink,CommonModule],
  templateUrl: './data-analysis.html',
  styleUrl: './data-analysis.css'
})
export class DataAnalysis {

}