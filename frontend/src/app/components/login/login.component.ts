import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="title-icon">directions_car</mat-icon>
            Location de Voiture
          </mat-card-title>
          <mat-card-subtitle>Connexion Agent</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="admin&#64;location.com">
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email requis</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width mt-2">
              <mat-label>Mot de passe</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Mot de passe requis</mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" class="full-width mt-2" type="submit" [disabled]="loginForm.invalid || loading">
              <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">Se connecter</span>
            </button>
          </form>
        </mat-card-content>
        
        <mat-card-footer class="text-center mt-2">
          <p class="hint">Email: admin&#64;location.com</p>
          <p class="hint">Mot de passe: admin123</p>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container { height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .login-card { width: 400px; padding: 30px; }
    .title-icon { font-size: 32px; width: 32px; height: 32px; margin-right: 10px; color: #1976d2; }
    mat-card-title { display: flex; align-items: center; font-size: 24px; justify-content: center; }
    mat-card-subtitle { text-align: center; margin-top: 8px; }
    .hint { color: #666; font-size: 12px; margin: 4px 0; }
    .mt-2 { margin-top: 16px; }
    .full-width { width: 100%; }
    button mat-spinner { display: inline-block; margin-right: 8px; }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['admin@location.com', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.snackBar.open('Connexion réussie !', 'Fermer', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Erreur de connexion', 'Fermer', { duration: 5000 });
      }
    });
  }
}