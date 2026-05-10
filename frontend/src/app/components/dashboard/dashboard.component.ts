import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';
import { LocationService } from '../../services/location.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <h1 class="page-title">Tableau de bord</h1>

    <div *ngIf="loading" class="text-center">
      <mat-spinner diameter="50"></mat-spinner>
    </div>

    <div *ngIf="!loading && stats" class="stats-grid">
      <mat-card class="stat-card clients">
        <mat-icon>people</mat-icon>
        <div class="stat-value">{{ stats.total_clients }}</div>
        <div class="stat-label">Clients</div>
      </mat-card>

      <mat-card class="stat-card vehicules">
        <mat-icon>directions_car</mat-icon>
        <div class="stat-value">{{ stats.total_vehicules }}</div>
        <div class="stat-label">Véhicules</div>
      </mat-card>

      <mat-card class="stat-card disponibles">
        <mat-icon>check_circle</mat-icon>
        <div class="stat-value">{{ stats.vehicules_disponibles }}</div>
        <div class="stat-label">Disponibles</div>
      </mat-card>

      <mat-card class="stat-card loues">
        <mat-icon>block</mat-icon>
        <div class="stat-value">{{ stats.vehicules_loues }}</div>
        <div class="stat-label">Loués</div>
      </mat-card>

      <mat-card class="stat-card locations">
        <mat-icon>assignment</mat-icon>
        <div class="stat-value">{{ stats.locations_en_cours }}</div>
        <div class="stat-label">Locations en cours</div>
      </mat-card>

      <mat-card class="stat-card revenus">
        <mat-icon>euro</mat-icon>
        <div class="stat-value">{{ stats.revenus_total | number:'1.2-2' }} €</div>
        <div class="stat-label">Revenus totaux</div>
      </mat-card>
    </div>

    <mat-card class="card mt-2" *ngIf="!loading && recentLocations.length > 0">
      <mat-card-header>
        <mat-card-title>Dernières locations</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <table class="data-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Véhicule</th>
              <th>Dates</th>
              <th>Montant</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let loc of recentLocations">
              <td>{{ loc.client_prenom }} {{ loc.client_nom }}</td>
              <td>{{ loc.vehicule_marque }} {{ loc.vehicule_modele }}</td>
              <td>{{ loc.date_debut }} → {{ loc.date_fin }}</td>
              <td>{{ loc.montant_total | number:'1.2-2' }} €</td>
              <td>
                <span class="badge" [class]="'status-' + loc.statut">{{ loc.statut }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .stat-card { display: flex; flex-direction: column; align-items: center; padding: 24px; }
    .stat-card mat-icon { font-size: 40px; width: 40px; height: 40px; margin-bottom: 12px; }
    .stat-card.clients mat-icon { color: #2196f3; }
    .stat-card.vehicules mat-icon { color: #4caf50; }
    .stat-card.disponibles mat-icon { color: #8bc34a; }
    .stat-card.loues mat-icon { color: #ff9800; }
    .stat-card.locations mat-icon { color: #9c27b0; }
    .stat-card.revenus mat-icon { color: #f44336; }
    .stat-value { font-size: 28px; font-weight: 700; }
    .stat-label { color: #666; margin-top: 4px; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
    .data-table th { background: #f5f5f5; font-weight: 500; }
    .badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-en_cours { background: #e3f2fd; color: #1976d2; }
    .status-termine { background: #e8f5e9; color: #388e3c; }
    .status-annule { background: #fafafa; color: #616161; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  recentLocations: any[] = [];
  loading = true;

  constructor(
    private dashboardService: DashboardService,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.dashboardService.getRecentLocations().subscribe({
      next: (locations) => {
        this.recentLocations = locations;
      }
    });
  }
}
