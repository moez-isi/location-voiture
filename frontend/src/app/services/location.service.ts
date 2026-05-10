import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
const API_URL = environment.apiUrl;

export interface Location {
  id?: number;
  client_id: number;
  vehicule_id: number;
  agent_id?: number;
  date_debut: string;
  date_fin: string;
  montant_total?: number;
  statut?: string;
  client_nom?: string;
  client_prenom?: string;
  vehicule_marque?: string;
  vehicule_modele?: string;
  immatriculation?: string;
  prix_jour?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Location[]> {
    return this.http.get<Location[]>(`${API_URL}/locations`);
  }

  getEnCours(): Observable<Location[]> {
    return this.http.get<Location[]>(`${API_URL}/locations/en-cours`);
  }

  create(location: Location): Observable<Location> {
    return this.http.post<Location>(`${API_URL}/locations`, location);
  }

  retourner(id: number): Observable<any> {
    return this.http.put(`${API_URL}/locations/${id}/retour`, {});
  }

  annuler(id: number): Observable<any> {
    return this.http.put(`${API_URL}/locations/${id}/annuler`, {});
  }
}
