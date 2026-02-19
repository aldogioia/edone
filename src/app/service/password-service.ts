import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Environment} from '../utils/Enviroment';

@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  private baseUrl = Environment.getInstance().apiUrl + 'password';

  constructor(private http: HttpClient) {}

  requestReset(telephone: string): Observable<any> {
    const url = `${this.baseUrl}/sign-in?phoneNumber=${telephone}`;
    return this.http.post(url, {});
  }

  reset(token: string, newPassword: string): Observable<any> {
    const url = `${this.baseUrl}/sign-in?token=${token}&password=${newPassword}`;
    return this.http.patch(url, {});
  }
}
