import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
const API_URL = environment.apiUrl;

export interface DashboardStats {
  total_clients: number;
  total_vehicules: number;
  vehicules_disponibles: number;
  vehicules_loues: number;
  locations_en_cours: number;
  locations_terminees: number;
  revenus_total: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${API_URL}/dashboard/stats`);
  }

  getRecentLocations(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/dashboard/recent-locations`);
  }
}
