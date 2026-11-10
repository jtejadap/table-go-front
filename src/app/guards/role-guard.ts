import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
 
  // 1) Sin sesión (o token vencido) -> login
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }
 
  // 2) Roles permitidos definidos en la ruta: data: { roles: ['ADMINISTRADOR'] }
  const expectedRoles = (route.data['roles'] as string[] | undefined) ?? [];
 
  // Si la ruta no define roles, basta con estar autenticado
  if (!expectedRoles.length || authService.hasRole(expectedRoles)) {
    return true;
  }
 
  // 3) Autenticado pero sin permiso
  return router.createUrlTree(['/unauthorized']);
};