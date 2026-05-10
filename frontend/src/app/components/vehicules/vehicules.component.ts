import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { VehiculeService, Vehicule } from '../../services/vehicule.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-vehicules',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h1 class="page-title">Gestion des Véhicules</h1>

    <mat-card class="card">
      <mat-card-header>
        <mat-card-title>{{ editing ? 'Modifier' : 'Ajouter' }} un véhicule</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="vehiculeForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Marque</mat-label>
              <input matInput formControlName="marque" required>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Modèle</mat-label>
              <input matInput formControlName="modele" required>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Immatriculation</mat-label>
              <input matInput formControlName="immatriculation" required>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Année</mat-label>
              <input matInput type="number" formControlName="annee">
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Prix / jour (€)</mat-label>
              <input matInput type="number" formControlName="prix_jour" required>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Statut</mat-label>
              <mat-select formControlName="statut">
                <mat-option value="disponible">Disponible</mat-option>
                <mat-option value="loue">Loué</mat-option>
                <mat-option value="maintenance">Maintenance</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="vehiculeForm.invalid">
              <mat-icon>{{ editing ? 'save' : 'add' }}</mat-icon>
              {{ editing ? 'Modifier' : 'Ajouter' }}
            </button>
            <button mat-button type="button" (click)="resetForm()" *ngIf="editing">
              <mat-icon>close</mat-icon> Annuler
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>

    <mat-card class="card">
      <mat-card-header>
        <mat-card-title>Liste des véhicules</mat-card-title>
      </mat-card-header>
      <mat-card-content class="table-container">
        <div *ngIf="loading" class="text-center">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
        <table mat-table [dataSource]="vehicules" class="mat-elevation-z0" *ngIf="!loading">
          <ng-container matColumnDef="marque">
            <th mat-header-cell *matHeaderCellDef>Véhicule</th>
            <td mat-cell *matCellDef="let v">{{ v.marque }} {{ v.modele }}</td>
          </ng-container>
          <ng-container matColumnDef="immatriculation">
            <th mat-header-cell *matHeaderCellDef>Immatriculation</th>
            <td mat-cell *matCellDef="let v">{{ v.immatriculation }}</td>
          </ng-container>
          <ng-container matColumnDef="prix_jour">
            <th mat-header-cell *matHeaderCellDef>Prix/jour</th>
            <td mat-cell *matCellDef="let v">{{ v.prix_jour | number:'1.2-2' }} €</td>
          </ng-container>
          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let v">
              <span [class]="'status-' + v.statut">{{ v.statut }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let v">
              <button mat-icon-button color="primary" (click)="editVehicule(v)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteVehicule(v.id)">
                <mat-icon>delete</mat-icon>
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
    .status-disponible { color: #4caf50; font-weight: 500; }
    .status-loue { color: #ff9800; font-weight: 500; }
    .status-maintenance { color: #f44336; font-weight: 500; }
  `]
})
export class VehiculesComponent implements OnInit {
  vehicules: Vehicule[] = [];
  vehiculeForm: FormGroup;
  editing = false;
  editingId: number | null = null;
  loading = true;
  displayedColumns = ['marque', 'immatriculation', 'prix_jour', 'statut', 'actions'];

  constructor(
    private fb: FormBuilder,
    private vehiculeService: VehiculeService,
    private snackBar: MatSnackBar
  ) {
    this.vehiculeForm = this.fb.group({
      marque: ['', Validators.required],
      modele: ['', Validators.required],
      immatriculation: ['', Validators.required],
      annee: [null],
      prix_jour: [null, [Validators.required, Validators.min(0)]],
      statut: ['disponible']
    });
  }

  ngOnInit(): void {
    this.loadVehicules();
  }

  loadVehicules(): void {
    this.loading = true;
    this.vehiculeService.getAll().subscribe({
      next: (data) => { this.vehicules = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onSubmit(): void {
    if (this.vehiculeForm.invalid) return;
    const vehicule = this.vehiculeForm.value;

    if (this.editing && this.editingId) {
      this.vehiculeService.update(this.editingId, vehicule).subscribe({
        next: () => {
          this.snackBar.open('Véhicule modifié !', 'Fermer', { duration: 3000, panelClass: 'success-snackbar' });
          this.resetForm();
          this.loadVehicules();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Erreur', 'Fermer', { duration: 5000, panelClass: 'error-snackbar' });
        }
      });
    } else {
      this.vehiculeService.create(vehicule).subscribe({
        next: () => {
          this.snackBar.open('Véhicule ajouté !', 'Fermer', { duration: 3000, panelClass: 'success-snackbar' });
          this.resetForm();
          this.loadVehicules();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Erreur', 'Fermer', { duration: 5000, panelClass: 'error-snackbar' });
        }
      });
    }
  }

  editVehicule(v: Vehicule): void {
    this.editing = true;
    this.editingId = v.id || null;
    this.vehiculeForm.patchValue(v);
  }

  deleteVehicule(id: number): void {
    if (confirm('Supprimer ce véhicule ?')) {
      this.vehiculeService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Véhicule supprimé !', 'Fermer', { duration: 3000, panelClass: 'success-snackbar' });
          this.loadVehicules();
        },
        error: () => {
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 5000, panelClass: 'error-snackbar' });
        }
      });
    }
  }

  resetForm(): void {
    this.editing = false;
    this.editingId = null;
    this.vehiculeForm.reset({ statut: 'disponible' });
  }
}
