import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClientService, Client } from '../../services/client.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatDialogModule, MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h1 class="page-title">Gestion des Clients</h1>

    <mat-card class="card">
      <mat-card-header>
        <mat-card-title>{{ editing ? 'Modifier' : 'Ajouter' }} un client</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="clientForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Nom</mat-label>
              <input matInput formControlName="nom" required>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Prénom</mat-label>
              <input matInput formControlName="prenom" required>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Téléphone</mat-label>
              <input matInput formControlName="telephone">
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>CIN</mat-label>
              <input matInput formControlName="cin">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Adresse</mat-label>
              <input matInput formControlName="adresse">
            </mat-form-field>
          </div>
          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="clientForm.invalid">
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
        <mat-card-title>Liste des clients</mat-card-title>
      </mat-card-header>
      <mat-card-content class="table-container">
        <div *ngIf="loading" class="text-center">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
        <table mat-table [dataSource]="clients" class="mat-elevation-z0" *ngIf="!loading">
          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Nom</th>
            <td mat-cell *matCellDef="let c">{{ c.nom }} {{ c.prenom }}</td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let c">{{ c.email }}</td>
          </ng-container>
          <ng-container matColumnDef="telephone">
            <th mat-header-cell *matHeaderCellDef>Téléphone</th>
            <td mat-cell *matCellDef="let c">{{ c.telephone }}</td>
          </ng-container>
          <ng-container matColumnDef="cin">
            <th mat-header-cell *matHeaderCellDef>CIN</th>
            <td mat-cell *matCellDef="let c">{{ c.cin }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let c">
              <button mat-icon-button color="primary" (click)="editClient(c)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteClient(c.id)">
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
  `]
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  clientForm: FormGroup;
  editing = false;
  editingId: number | null = null;
  loading = true;
  displayedColumns = ['nom', 'email', 'telephone', 'cin', 'actions'];

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private snackBar: MatSnackBar
  ) {
    this.clientForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: [''],
      telephone: [''],
      cin: [''],
      adresse: ['']
    });
  }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    this.clientService.getAll().subscribe({
      next: (data) => { this.clients = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) return;
    const client = this.clientForm.value;

    if (this.editing && this.editingId) {
      this.clientService.update(this.editingId, client).subscribe({
        next: () => {
          this.snackBar.open('Client modifié !', 'Fermer', { duration: 3000, panelClass: 'success-snackbar' });
          this.resetForm();
          this.loadClients();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Erreur', 'Fermer', { duration: 5000, panelClass: 'error-snackbar' });
        }
      });
    } else {
      this.clientService.create(client).subscribe({
        next: () => {
          this.snackBar.open('Client ajouté !', 'Fermer', { duration: 3000, panelClass: 'success-snackbar' });
          this.resetForm();
          this.loadClients();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Erreur', 'Fermer', { duration: 5000, panelClass: 'error-snackbar' });
        }
      });
    }
  }

  editClient(client: Client): void {
    this.editing = true;
    this.editingId = client.id || null;
    this.clientForm.patchValue(client);
  }

  deleteClient(id: number): void {
    if (confirm('Supprimer ce client ?')) {
      this.clientService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Client supprimé !', 'Fermer', { duration: 3000, panelClass: 'success-snackbar' });
          this.loadClients();
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
    this.clientForm.reset();
  }
}
