import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import {TokenHandler} from './token-handler';

export const authGuard: CanActivateFn = (_, state) => {
  const router = inject(Router);
  const tokenHandler = inject(TokenHandler);

  const accessToken = tokenHandler.getAccessToken();

  if (!accessToken) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } }).then();
    return false;
  }

  return true;
};
