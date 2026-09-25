import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './roles';

// Permite la ruta solo si el access token trae alguno de los roles indicados.
// Se usa junto a MsalGuard, que es el que exige tener sesión iniciada.
export function roleGuard(...allowed: Role[]): CanActivateFn {
  return async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      return false;
    }

    try {
      await auth.loadClaims();
    } catch {
      return router.createUrlTree(['/login']);
    }

    return auth.hasAnyRole(...allowed) || router.createUrlTree(['/unauthorized']);
  };
}
