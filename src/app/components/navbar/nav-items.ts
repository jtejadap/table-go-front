export interface NavItem {
  label: string;
  /** Clase de Remix Icon, ej: 'ri-pie-chart-2-fill' */
  icon: string;
  route: string;
  /** true = activo solo si la URL coincide exactamente (úsalo en las páginas de inicio) */
  exact?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Las claves deben coincidir con los roles de tu AuthService (en MAYÚSCULAS).
 * Las rutas de "Inicio" coinciden con ROLE_HOME de tu servicio.
 * Modifica libremente las demás rutas.
 */
export const NAV_BY_ROLE: Record<string, NavSection[]> = {
  ADMINISTRADOR: [
    {
      title: 'ADMINISTRAR',
      items: [
        { label: 'Inicio', icon: 'ri-pie-chart-2-fill', route: '/admin', exact: true },
        { label: 'Restaurante', icon: 'ri-group-fill', route: '/restaurante' },
        { label: 'Staff', icon: 'ri-group-fill', route: '/staff' },
        { label: 'Mesas', icon: 'ri-table-fill', route: '/mesas' },
        { label: 'Menú', icon: 'ri-restaurant-fill', route: '/menu' },
      ],
    },    
  ],

  RECEPCIONISTA: [
    {
      title: 'RECEPCIÓN',
      items: [
        { label: 'Inicio', icon: 'ri-pie-chart-2-fill', route: '/recepcion', exact: true },
        { label: 'Reservas del Día', icon: 'ri-calendar-check-fill', route: '/reservas' },
      ],
    },
  ],

  CLIENTE: [
    {
      title: 'ADMINISTRAR',
      items: [
        { label: 'Inicio', icon: 'ri-pie-chart-2-fill', route: '/inicio', exact: true },
        { label: 'Hacer Reserva', icon: 'ri-add-circle-fill', route: '/restaurantes' },
        { label: 'Ver Mis Reservas', icon: 'ri-calendar-fill', route: '/mis-reservas' },
      ],
    },
  ],
};