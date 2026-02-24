import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Environment} from '../utils/environment';

@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  private baseUrl = Environment.getInstance().apiUrl + 'password';

  constructor(private http: HttpClient) {}

  requestReset(phoneNumber: string): Observable<any> {
    const params = new HttpParams()
      .set('phoneNumber', phoneNumber)
    const url = `${this.baseUrl}/request-reset`;
    return this.http.post(url, {}, { params });
  }

  reset(token: string, newPassword: string): Observable<any> {
    const params = new HttpParams()
      .set('token', token)
      .set('password', newPassword);

    const url = `${this.baseUrl}/reset`;
    return this.http.patch(url, {} , { params });
  }
}
