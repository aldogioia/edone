import {Injectable} from '@angular/core';
import {Observable, tap, throwError} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {TokenHandler} from '../security/token-handler';
import {Environment} from '../utils/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = Environment.getInstance().apiUrl + 'auth';

  constructor(
    private http: HttpClient,
    private tokenHandler: TokenHandler
  ) {}

  signIn(phoneNumber: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set('phoneNumber', phoneNumber)
      .set('password', password);
    return this.http.post<any>(`${this.baseUrl}/sign-in`, {}, { params: params })
      .pipe(tap(response => {
          console.log('[AuthService] signIn response:', response);
          if (response.accessToken && response.refreshToken) {
            this.tokenHandler.setTokens(response.accessToken, response.refreshToken);
          } else {
            console.error('[AuthService] Tokens mancanti nella risposta!');
          }
        })
      );
  }

  refreshToken(): Observable<{ accessToken: string; refreshToken?: string }> {
    const refresh = this.tokenHandler.getRefreshToken();
    if (!refresh) {
      console.warn('[AuthService] Nessun refresh token disponibile');
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<{ accessToken: string; refreshToken?: string }>(
      `${this.baseUrl}/refresh`,
      {},
      {
        headers: { 'X-Refresh-Token': refresh }
      }
    ).pipe(
      tap(res => {
        if (res?.accessToken) {
          this.tokenHandler.setAccessToken(res.accessToken);
          console.log('[AuthService] Nuovo access token salvato');
        }
        if (res?.refreshToken) {
          this.tokenHandler.setRefreshToken(res.refreshToken);
          console.log('[AuthService] Nuovo refresh token salvato');
        }
      })
    );
  }
}
