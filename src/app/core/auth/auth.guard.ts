import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from './auth.service';

const roleGuard = (role: UserRole): CanActivateFn => {
  return (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.hasRole(role)) {
      return true;
    }

    return router.createUrlTree(['/auth'], {
      queryParams: {
        role,
        returnUrl: state.url,
      },
    });
  };
};

export const adminGuard = roleGuard('admin');
export const userGuard = roleGuard('user');

export const signedInGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isSignedIn()) {
    return true;
  }

  return router.createUrlTree(['/auth'], {
    queryParams: {
      returnUrl: state.url,
    },
  });
};

export const adminOrUserGuard = signedInGuard;
