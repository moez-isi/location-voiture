import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
const API_URL = environment.apiUrl;

export interface Vehicule {
  id?: number;
  marque: string;
  modele: string;
  immatriculation: string;
  annee?: number;
  prix_jour: number;
  statut?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehiculeService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Vehicule[]> {
    return this.http.get<Vehicule[]>(`${API_URL}/vehicules`);
  }

  getDisponibles(): Observable<Vehicule[]> {
    return this.http.get<Vehicule[]>(`${API_URL}/vehicules/disponibles`);
  }

  getById(id: number): Observable<Vehicule> {
    return this.http.get<Vehicule>(`${API_URL}/vehicules/${id}`);
  }

  create(vehicule: Vehicule): Observable<Vehicule> {
    return this.http.post<Vehicule>(`${API_URL}/vehicules`, vehicule);
  }

  update(id: number, vehicule: Vehicule): Observable<Vehicule> {
    return this.http.put<Vehicule>(`${API_URL}/vehicules/${id}`, vehicule);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/vehicules/${id}`);
  }
}
