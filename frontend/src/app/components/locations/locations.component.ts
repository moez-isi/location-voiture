import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LocationService, Location } from '../../services/location.service';
import { ClientService, Client } from '../../services/client.service';
import { VehiculeService, Vehicule } from '../../services/vehicule.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatChipsModule
  ],
  template: `
    <h1 class="page-title">Gestion des Locations</h1>

    <mat-card class="card">
      <mat-card-header>
        <mat-card-title>Créer une location</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="locationForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Client</mat-label>
              <mat-select formControlName="client_id" required>
                <mat-option *ngFor="let c of clients" [value]="c.id">
                  {{ c.prenom }} {{ c.nom }}
                </mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Véhicule disponible</mat-label>
              <mat-select formControlName="vehicule_id" required>
                <mat-option *ngFor="let v of vehiculesDisponibles" [value]="v.id">
                  {{ v.marque }} {{ v.modele }} ({{ v.immatriculation }}) - {{ v.prix_jour }}€/j
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Date début</mat-label>
              <input matInput [matDatepicker]="picker1" formControlName="date_debut" required>
              <mat-datepicker-toggle matSuffix [for]="picker1"></mat-datepicker-toggle>
              <mat-datepicker #picker1></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Date fin</mat-label>
              <input matInput [matDatepicker]="picker2" formControlName="date_fin" required>
              <mat-datepicker-toggle matSuffix [for]="picker2"></mat-datepicker-toggle>
              <mat-datepicker #picker2></mat-datepicker>
            </mat-form-field>
          </div>
          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="locationForm.invalid">
              <mat-icon>add</mat-icon> Créer la location
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>

    <mat-card class="card">
      <mat-card-header>
        <mat-card-title>Liste des locations</mat-card-title>
      </mat-card-header>
      <mat-card-content class="table-container">
        <div *ngIf="loading" class="text-center">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
        <table mat-table [dataSource]="locations" class="mat-elevation-z0" *ngIf="!loading">
          <ng-container matColumnDef="client">
            <th mat-header-cell *matHeaderCellDef>Client</th>
            <td mat-cell *matCellDef="let l">{{ l.client_prenom }} {{ l.client_nom }}</td>
          </ng-container>
          <ng-container matColumnDef="vehicule">
            <th mat-header-cell *matHeaderCellDef>Véhicule</th>
            <td mat-cell *matCellDef="let l">{{ l.vehicule_marque }} {{ l.vehicule_modele }}</td>
          </ng-container>
          <ng-container matColumnDef="dates">
            <th mat-header-cell *matHeaderCellDef>Dates</th>
            <td mat-cell *matCellDef="let l">{{ l.date_debut }} → {{ l.date_fin }}</td>
          </ng-container>
          <ng-container matColumnDef="montant">
            <th mat-header-cell *matHeaderCellDef>Montant</th>
            <td mat-cell *matCellDef="let l">{{ l.montant_total | number:'1.2-2' }} €</td>
          </ng-container>
          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let l">
              <span [class]="'status-' + l.statut">{{ l.statut }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let l">
              <button mat-icon-button color="primary" (click)="retourner(l.id)" *ngIf="l.statut === 'en_cours'" matTooltip="Retour véhicule">
                <mat-icon>assignment_return</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="annuler(l.id)" *ngIf="l.statut === 'en_cours'" matTooltip="Annuler">
                <mat-icon>cancel</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 8px; }
    .form-actions { display: flex; gap: 12px; margin-top: 16px; }
    table { width: 100%; }
    .text-center { text-align: center; padding: 20px; }
    .status-en_cours { color: #2196f3; font-weight: 500; }
    .status-termine { color: #4caf50; font-weight: 500; }
    .status-annule { color: #9e9e9e; font-weight: 500; }
  `]
})
export class LocationsComponent implements OnInit {
  locations: Location[] = [];
  clients: Client[] = [];
  vehiculesDisponibles: Vehicule[] = [];
  locationForm: FormGroup;
  loading = true;
  displayedColumns = ['client', 'vehicule', 'dates', 'montant', 'statut', 'actions'];

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private clientService: ClientService,
    private vehiculeService: VehiculeService,
    private snackBar: MatSnackBar
  ) {
    this.locationForm = this.fb.group({
      client_id: [null, Validators.required],
      vehicule_id: [null, Validators.required],
      date_debut: [null, Validators.required],
      date_fin: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.locationService.getAll().subscribe({
      next: (data) => { this.locations = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.clientService.getAll().subscribe({
      next: (data) => { this.clients = data; }
    });
    this.vehiculeService.getDisponibles().subscribe({
      next: (data) => { this.vehiculesDisponibles = data; }
    });
  }

  onSubmit(): void {
    if (this.locationForm.invalid) return;
    const location = this.locationForm.value;
    // Format dates
    location.date_debut = this.formatDate(location.date_debut);
    location.date_fin = this.formatDate(location.date_fin);

    this.locationService.create(location).subscribe({
      next: () => {
        this.snackBar.open('Location créée !', 'Fermer', { duration: 3000, panelClass: 'success-snackbar' });
        this.locationForm.reset();
        this.loadData();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Erreur', 'Fermer', { duration: 5000, panelClass: 'error-snackbar' });
      }
    });
  }

  retourner(id: number): void {
    if (confirm('Confirmer le retour du véhicule ?')) {
      this.locationService.retourner(id).subscribe({
        next: () => {
          this.snackBar.open('Véhicule retourné !', 'Fermer', { duration: 3000, panelClass: 'success-snackbar' });
          this.loadData();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Erreur', 'Fermer', { duration: 5000, panelClass: 'error-snackbar' });
        }
      });
    }
  }

  annuler(id: number): void {
    if (confirm('Annuler cette location ?')) {
      this.locationService.annuler(id).subscribe({
        next: () => {
          this.snackBar.open('Location annulée !', 'Fermer', { duration: 3000, panelClass: 'success-snackbar' });
          this.loadData();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Erreur', 'Fermer', { duration: 5000, panelClass: 'error-snackbar' });
        }
      });
    }
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}
