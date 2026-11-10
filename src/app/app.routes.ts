// app.routes.ts
import { Routes } from '@angular/router';
import { roleGuard } from './guards/role-guard';
import { AdminHome } from './admin-features/components/admin-home/admin-home';
import { UserHome } from './user-features/components/user-home/user-home';
import { ReceptionistHome } from './recept-features/components/receptionist-home/receptionist-home';
import { Unauthorized} from './components/unauthorized/unauthorized';
import { Login } from './components/login/login';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: 'admin',
    component: AdminHome,
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR'] } // Roles permitidos
  },
  {
    path: 'inicio',
    component: UserHome, 
    canActivate: [roleGuard],
    data: { roles: ['CLIENTE'] }
  },
  {
    path: 'recepcion',
    component: ReceptionistHome, 
    canActivate: [roleGuard],
    data: { roles: ['RECEPCIONISTA'] }
  },
  {
    path: 'unauthorized',
    component: Unauthorized // Componente que muestra un mensaje de acceso denegado
  }
];
