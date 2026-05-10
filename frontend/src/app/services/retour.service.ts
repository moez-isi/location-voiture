import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
const API_URL = environment.apiUrl;

export interface Retour {
  id?: number;
  location_id: number;
  date_retour?: string;
  etat?: string;
  kilometrage_retour?: number;
  observations?: string;
  client_nom?: string;
  vehicule_marque?: string;
  immatriculation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RetourService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Retour[]> {
    return this.http.get<Retour[]>(`${API_URL}/retours`);
  }

  create(retour: Retour): Observable<any> {
    return this.http.post(`${API_URL}/retours`, retour);
  }
}
