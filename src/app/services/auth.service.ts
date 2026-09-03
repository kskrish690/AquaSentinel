import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL =
    'https://airy-respect-production-9971.up.railway.app/api/auth';

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, user);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, {
      email,
      password
    });
  }
}