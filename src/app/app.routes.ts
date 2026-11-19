// app.routes.ts
import { Routes } from '@angular/router';
import { roleGuard } from './guards/role-guard';
import { AdminHome } from './admin-features/components/admin-home/admin-home';
import { UserHome } from './user-features/components/user-home/user-home';
import { ReceptionistHome } from './recept-features/components/receptionist-home/receptionist-home';
import { Unauthorized } from './components/unauthorized/unauthorized';
import { Login } from './components/login/login';
import { MyRestaurant } from './admin-features/components/my-restaurant/my-restaurant';
import { ProductoAdmin } from './admin-features/components/producto-admin/producto-admin';
import { MesaAdmin } from './admin-features/components/mesa-admin/mesa-admin';
import { ReservaFlow } from './user-features/components/reserva-flow/reserva-flow';
import { RestaurantesExplorer } from './user-features/components/restaurantes-explorer/restaurantes-explorer';
import { ReservasGestion } from './recept-features/components/reservas-gestion/reservas-gestion';
import { UsersAdmin } from './admin-features/components/users-admin/users-admin';
import { MisReservas } from './user-features/components/mis-reservas/mis-reservas';
import { AppLayout } from './components/app-layout/app-layout';
import { LandingPage } from './components/landing-page/landing-page';

export const routes: Routes = [
  // 1) La landing es lo primero que ve el usuario en "/"
  { path: '', component: LandingPage, pathMatch: 'full' },

  // 2) Login (público)
  { path: 'login', component: Login },

  // 3) Rutas protegidas: AppLayout como shell
  {
    path: '',
    component: AppLayout,
    canActivate: [roleGuard],
    children: [
      { path: 'admin',       component: AdminHome,           canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'restaurante', component: MyRestaurant,        canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'menu',        component: ProductoAdmin,       canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'mesas',       component: MesaAdmin,           canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'staff',       component: UsersAdmin,          canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'inicio',      component: UserHome,            canActivate: [roleGuard], data: { roles: ['CLIENTE'] } },
      { path: 'mis-reservas',component: MisReservas,         canActivate: [roleGuard], data: { roles: ['CLIENTE'] } },
      { path: 'restaurantes/:id', component: ReservaFlow,    canActivate: [roleGuard], data: { roles: ['CLIENTE'] } },
      { path: 'restaurantes',component: RestaurantesExplorer,canActivate: [roleGuard], data: { roles: ['CLIENTE'] } },
      { path: 'recepcion',   component: ReceptionistHome,    canActivate: [roleGuard], data: { roles: ['RECEPCIONISTA'] } },
      { path: 'reservas',    component: ReservasGestion,     canActivate: [roleGuard], data: { roles: ['RECEPCIONISTA'] } },
    ],
  },

  // 4) Fallback
  { path: 'unauthorized', component: Unauthorized },
  { path: '**', redirectTo: '' },
];