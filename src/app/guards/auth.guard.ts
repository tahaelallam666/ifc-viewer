import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard - Protects routes from unauthorized access
 * 
 * Usage in routes:
 * { path: 'ifc-viewer', component: IfcViewerComponent, canActivate: [authGuard] }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated) {
    // User is authenticated, allow access
    return true;
  }

  // User is not authenticated, redirect to login
  console.log('Access denied. Redirecting to login...');
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  return false;
};
