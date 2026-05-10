import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentAgentSubject = new BehaviorSubject<any>(null);
  public currentAgent$ = this.currentAgentSubject.asObservable();

  constructor(private http: HttpClient) {
    const agent = localStorage.getItem('agent');
    if (agent) {
      this.currentAgentSubject.next(JSON.parse(agent));
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${API_URL}/auth/login`, { email, password }).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('agent', JSON.stringify(response.agent));
        this.currentAgentSubject.next(response.agent);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('agent');
    this.currentAgentSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentAgent(): any {
    return this.currentAgentSubject.value;
  }
}
