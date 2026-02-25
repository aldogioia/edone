import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import {AuthService} from '../service/auth-service';
import {TokenHandler} from './token-handler';

let isRefreshing = false;
let refreshSubject = new BehaviorSubject<string | null>(null);

export function tokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const tokenHandler = inject(TokenHandler);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (req.url.includes('refresh')) {
    return next(req);
  }

  const accessToken = tokenHandler.getAccessToken();
  let authReq = req;

  if (accessToken && !req.headers.has('Authorization')) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const refreshToken = tokenHandler.getRefreshToken();
        if (!refreshToken) {
          console.warn('[INTERCEPTOR] Nessun refresh token -> logout');
          tokenHandler.clearTokens();
          router.navigate(['/login']).then();
          return throwError(() => error);
        }

        if (!isRefreshing) {
          isRefreshing = true;
          refreshSubject.next(null);

          console.warn('[INTERCEPTOR] Access token scaduto, faccio refresh...');
          return authService.refreshToken().pipe(
            switchMap((res: any) => {
              const newAccess = res?.accessToken;
              if (!newAccess) {
                console.error('[INTERCEPTOR] Refresh fallito: nessun access token');
                tokenHandler.clearTokens();
                router.navigate(['/login']).then();
                return throwError(() => 'No access token in refresh response');
              }

              isRefreshing = false;
              refreshSubject.next(newAccess);

              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newAccess}` }
              });
              return next(retryReq);
            }),
            catchError(refreshError => {
              if (error.status !== 401) {
                return throwError(() => error);
              } else {
                console.error('[INTERCEPTOR] Refresh fallito:', refreshError);
                isRefreshing = false;
                tokenHandler.clearTokens();
                router.navigate(['/login']).then();
                return throwError(() => refreshError);
              }
            })
          );
        } else {
          return refreshSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token => {
              console.log('[INTERCEPTOR] Attendo refresh completato, ritento:', req.url);
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${token}` }
              });
              return next(retryReq);
            })
          );
        }
      }

      const errorMessage = error?.error?.message;
      alert(errorMessage);

      return throwError(() => errorMessage);
    })
  );
}
