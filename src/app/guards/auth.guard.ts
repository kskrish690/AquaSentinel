import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRoleService } from '../services/user-role';

export const authGuard: CanActivateFn = () => {

  const userRoleService = inject(UserRoleService);
  const router = inject(Router);

  if (userRoleService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(
    ['/auth'],
    {
      queryParams: {
        mode: 'login'
      }
    }
  );
};