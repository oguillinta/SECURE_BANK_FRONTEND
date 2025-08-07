import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { MsalService } from '@azure/msal-angular';

/**
 * Helper function to get user roles from MSAL token
 */
const getUserRoles = (msalService: MsalService): string[] => {
  const account = msalService.instance.getActiveAccount();
  if (account && account.idTokenClaims) {
    return (account.idTokenClaims as any)['roles'] || [];
  }
  return [];
};

export const canActivateAuthRole: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {
  const msalService = inject(MsalService);
  const router = inject(Router);

  const requiredRole = route.data['role'] as string;
  const requiredRoles = route.data['roles'] as string[];
  const requireAll = route.data['requireAll'] as boolean;

  const userRoles = getUserRoles(msalService);

  // Check single role
  if (requiredRole && userRoles.includes(requiredRole)) {
    return true;
  }

  // Check multiple roles (user needs ANY of these roles)
  if (
    requiredRoles &&
    !requireAll &&
    requiredRoles.some((role) => userRoles.includes(role))
  ) {
    return true;
  }

  // Check if requireAll is true (user needs ALL roles)
  if (
    requiredRoles &&
    requireAll &&
    requiredRoles.every((role) => userRoles.includes(role))
  ) {
    return true;
  }

  console.log('Access denied. User roles:', userRoles);
  console.log('Required role:', requiredRole);
  console.log('Required roles:', requiredRoles);

  // Redirect to dashboard or unauthorized page
  router.navigate(['/unauthorized']);
  return false;
};
