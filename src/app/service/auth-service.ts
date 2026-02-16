import {Injectable} from '@angular/core';
import {AuthResponse} from '../model/auth-response';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/v1/auth';

  constructor(private http: HttpClient) {}

  signIn(phoneNumber: string, password: string): Observable<AuthResponse> {
    const url = `${this.baseUrl}/sign-in?phoneNumber=${phoneNumber}&password=${password}`;
    return this.http.post<AuthResponse>(url, {});
  }
}
