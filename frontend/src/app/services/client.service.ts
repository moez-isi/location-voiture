import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
const API_URL = environment.apiUrl;

export interface Client {
  id?: number;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  cin?: string;
  adresse?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Client[]> {
    return this.http.get<Client[]>(`${API_URL}/clients`);
  }

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${API_URL}/clients/${id}`);
  }

  create(client: Client): Observable<Client> {
    return this.http.post<Client>(`${API_URL}/clients`, client);
  }

  update(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${API_URL}/clients/${id}`, client);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/clients/${id}`);
  }
}
