// app.routes.ts
import { Routes } from '@angular/router';
import { roleGuard } from './guards/role-guard';
import { AdminHome } from './admin-features/components/admin-home/admin-home';
import { UserHome } from './user-features/components/user-home/user-home';
import { ReceptionistHome } from './recept-features/components/receptionist-home/receptionist-home';
import { Unauthorized} from './components/unauthorized/unauthorized';
import { Login } from './components/login/login';
import { MyRestaurant } from './admin-features/components/my-restaurant/my-restaurant';
import { ProductoAdmin } from './admin-features/components/producto-admin/producto-admin';
import { MesaAdmin } from './admin-features/components/mesa-admin/mesa-admin';
import { ReservaFlow } from './user-features/components/reserva-flow/reserva-flow';
import { RestaurantesExplorer } from './user-features/components/restaurantes-explorer/restaurantes-explorer';
import { ReservasGestion } from './recept-features/components/reservas-gestion/reservas-gestion';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: 'admin',
    component: AdminHome,
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR'] } // Roles permitidos
  },
  {
    path: 'restaurante',
    component: MyRestaurant,
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR'] } 
  },
  {
    path: 'productos',
    component: ProductoAdmin,
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR'] }
  },
  {
    path: 'mesas',
    component: MesaAdmin,
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR'] } 
  },
  {
    path: 'inicio',
    component: UserHome, 
    canActivate: [roleGuard],
    data: { roles: ['CLIENTE'] }
  },
  {
    path: 'restaurantes/:id',
    component: ReservaFlow, 
    canActivate: [roleGuard],
    data: { roles: ['CLIENTE'] }
  },
  {
    path: 'restaurantes',
    component: RestaurantesExplorer, 
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
    path: 'reservas',
    component: ReservasGestion, 
    canActivate: [roleGuard],
    data: { roles: ['RECEPCIONISTA'] }
  },
  {
    path: 'unauthorized',
    component: Unauthorized // Componente que muestra un mensaje de acceso denegado
  }
];
