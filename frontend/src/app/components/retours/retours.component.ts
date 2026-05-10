import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RetourService, Retour } from '../../services/retour.service';
import { LocationService, Location } from '../../services/location.service';
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

@Component({
  selector: 'app-retours',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h1 class="page-title">Enregistrement des Retours</h1>

    <mat-card class="card">
      <mat-card-header>
        <mat-card-title>Enregistrer un retour</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="retourForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Location en cours</mat-label>
              <mat-select formControlName="location_id" required>
                <mat-option *ngFor="let l of locationsEnCours" [value]="l.id">
                  {{ l.client_prenom }} {{ l.client_nom }} — {{ l.vehicule_marque }} {{ l.vehicule_modele }} ({{ l.immatriculation }})
                  <br><small>Du {{ l.date_debut }} au {{ l.date_fin }}</small>
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Date de retour</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="date_retour" required>
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>État du véhicule</mat-label>
              <mat-select formControlName="etat">
                <mat-option value="bon">Bon</mat-option>
                <mat-option value="abime">Abîmé</mat-option>
                <mat-option value="mauvais">Mauvais</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Kilométrage retour</mat-label>
              <input matInput type="number" formControlName="kilometrage_retour">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Observations</mat-label>
              <input matInput formControlName="observations">
            </mat-form-field>
          </div>
          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="retourForm.invalid">
              <mat-icon>save</mat-icon> Enregistrer le retour
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>

    <mat-card class="card">
      <mat-card-header>
        <mat-card-title>Historique des retours</mat-card-title>
      </mat-card-header>
      <mat-card-content class="table-container">
        <div *ngIf="loading" class="text-center">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
        <table mat-table [dataSource]="retours" class="mat-elevation-z0" *ngIf="!loading">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let r">{{ r.date_retour }}</td>
          </ng-container>
          <ng-container matColumnDef="client">
            <th mat-header-cell *matHeaderCellDef>Client</th>
            <td mat-cell *matCellDef="let r">{{ r.client_nom }}</td>
          </ng-container>
          <ng-container matColumnDef="vehicule">
            <th mat-header-cell *matHeaderCellDef>Véhicule</th>
            <td mat-cell *matCellDef="let r">{{ r.vehicule_marque }} {{ r.vehicule_modele }}</td>
          </ng-container>
          <ng-container matColumnDef="etat">
            <th mat-header-cell *matHeaderCellDef>État</th>
            <td mat-cell *matCellDef="let r">
              <span [class]="'status-' + r.etat">{{ r.etat }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="observations">
            <th mat-header-cell *matHeaderCellDef>Observations</th>
            <td mat-cell *matCellDef="let r">{{ r.observations || '-' }}</td>
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
    .status-bon { color: #4caf50; font-weight: 500; }
    .status-abime { color: #ff9800; font-weight: 500; }
    .status-mauvais { color: #f44336; font-weight: 500; }
  `]
})
export class RetoursComponent implements OnInit {
  retours: Retour[] = [];
  locationsEnCours: Location[] = [];
  retourForm: FormGroup;
  loading = true;
  displayedColumns = ['date', 'client', 'vehicule', 'etat', 'observations'];

  constructor(
    private fb: FormBuilder,
    private retourService: RetourService,
    private locationService: LocationService,
    private snackBar: MatSnackBar
  ) {
    this.retourForm = this.fb.group({
      location_id: [null, Validators.required],
      date_retour: [new Date(), Validators.required],
      etat: ['bon'],
      kilometrage_retour: [null],
      observations: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.retourService.getAll().subscribe({
      next: (data) => { this.retours = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.locationService.getEnCours().subscribe({
      next: (data) => { this.locationsEnCours = data; }
    });
  }

  onSubmit(): void {
    if (this.retourForm.invalid) return;
    const retour = this.retourForm.value;
    retour.date_retour = this.formatDate(retour.date_retour);

    this.retourService.create(retour).subscribe({
      next: () => {
        this.snackBar.open('Retour enregistré ! Véhicule remis en disponible.', 'Fermer', { duration: 4000, panelClass: 'success-snackbar' });
        this.retourForm.reset({ date_retour: new Date(), etat: 'bon' });
        this.loadData();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Erreur', 'Fermer', { duration: 5000, panelClass: 'error-snackbar' });
      }
    });
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}
