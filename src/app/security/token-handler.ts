import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenHandler {
  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';

  setTokens(access: string, refresh: string) {
    localStorage.setItem(this.accessTokenKey, access);
    localStorage.setItem(this.refreshTokenKey, refresh);
  }

  setAccessToken(token: string) {
    localStorage.setItem(this.accessTokenKey, token);
  }

  setRefreshToken(token: string) {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  clearTokens() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }
}
