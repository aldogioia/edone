import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:8080/api/v1/password';

  requestReset(telephone: string): Observable<any> {
    const url = `${this.baseUrl}/sign-in?phoneNumber=${telephone}`;
    return this.http.post(url, {});
  }

  reset(token: string, newPassword: string): Observable<any> {
    const url = `${this.baseUrl}/sign-in?token=${token}&password=${newPassword}`;
    return this.http.patch(url, {});
  }
}
