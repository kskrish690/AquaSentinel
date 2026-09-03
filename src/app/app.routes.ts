import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [

  // =========================
  // PUBLIC
  // =========================

  {
    path: '',
    loadComponent: () =>
      import('./home/home')
        .then(m => m.Home)
  },

  {
    path: 'auth',
    loadComponent: () =>
      import('./auth/auth')
        .then(m => m.Auth)
  },


  // =========================
  // PROTECTED
  // =========================

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/dashboard')
        .then(m => m.Dashboard)
  },

  {
    path: 'risk-map',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./risk-map/risk-map')
        .then(m => m.RiskMap)
  },

  {
    path: 'data-analysis',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./data-analysis/data-analysis')
        .then(m => m.DataAnalysis)
  },

  {
    path: 'replay',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./replay/replay')
        .then(m => m.Replay)
  },

  {
    path: 'alerts',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./alerts/alerts')
        .then(m => m.Alerts)
  },


  // =========================
  // FALLBACK
  // =========================

  {
    path: '**',
    redirectTo: ''
  }

];