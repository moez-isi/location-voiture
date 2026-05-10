import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'clients', 
    loadComponent: () => import('./components/clients/clients.component').then(m => m.ClientsComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'vehicules', 
    loadComponent: () => import('./components/vehicules/vehicules.component').then(m => m.VehiculesComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'locations', 
    loadComponent: () => import('./components/locations/locations.component').then(m => m.LocationsComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'retours', 
    loadComponent: () => import('./components/retours/retours.component').then(m => m.RetoursComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/login' }
];
