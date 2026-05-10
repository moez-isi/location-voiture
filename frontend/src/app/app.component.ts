import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink,
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatSidenavModule, MatListModule
  ],
  template: `
    <mat-toolbar color="primary" *ngIf="authService.isLoggedIn()">
      <button mat-icon-button (click)="toggleDrawer()">
        <mat-icon>menu</mat-icon>
      </button>
      <span>🚗 Location de Voiture</span>
      <span class="spacer"></span>
      <span class="agent-name">{{ authService.getCurrentAgent()?.prenom }} {{ authService.getCurrentAgent()?.nom }}</span>
      <button mat-icon-button (click)="logout()">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <mat-sidenav-container class="sidenav-container" *ngIf="authService.isLoggedIn()">
      <mat-sidenav #drawer mode="side" opened class="sidenav">
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span>Tableau de bord</span>
          </a>
          <a mat-list-item routerLink="/clients" routerLinkActive="active">
            <mat-icon matListItemIcon>people</mat-icon>
            <span>Clients</span>
          </a>
          <a mat-list-item routerLink="/vehicules" routerLinkActive="active">
            <mat-icon matListItemIcon>directions_car</mat-icon>
            <span>Véhicules</span>
          </a>
          <a mat-list-item routerLink="/locations" routerLinkActive="active">
            <mat-icon matListItemIcon>assignment</mat-icon>
            <span>Locations</span>
          </a>
          <a mat-list-item routerLink="/retours" routerLinkActive="active">
            <mat-icon matListItemIcon>assignment_return</mat-icon>
            <span>Retours</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>

    <div *ngIf="!authService.isLoggedIn()" class="login-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    .agent-name { margin-right: 16px; font-size: 14px; }
    .sidenav-container { height: calc(100vh - 64px); }
    .sidenav { width: 250px; background: #fafafa; }
    .content { padding: 20px; background: #f5f5f5; min-height: 100%; }
    .login-container { height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .active { background-color: #e3f2fd !important; color: #1976d2 !important; }
  `]
})
export class AppComponent {
  @ViewChild('drawer') drawer!: MatSidenav;

  constructor(public authService: AuthService, private router: Router) {}

  toggleDrawer(): void {
    this.drawer.toggle();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}