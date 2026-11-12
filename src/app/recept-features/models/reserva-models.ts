export type EstadoReserva =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'EN_CURSO'
  | 'COMPLETADA'
  | 'CANCELADA'
  | 'NO_SHOW';

export interface ItemResponse {
  productoId: number;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  nota: string | null;
}

export interface ReservaResponse {
  id: number;
  restauranteId: number;
  restaurante: string;
  clienteId: number;
  cliente: string;
  mesaId: number | null;
  mesaNumero: number | null;
  fechaHora: string; // LocalDateTime ISO, sin zona
  numPersonas: number;
  estado: EstadoReserva;
  notas: string | null;
  items: ItemResponse[];
  total: number;
}

export interface MesaResponse {
  id: number;
  numero: number;
  capacidad: number;
  activa: boolean;
}


export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface FiltrosReserva {
  estado: EstadoReserva | '';
  desde: string; // yyyy-MM-dd
  hasta: string;
  nombreCliente: string;
}

export interface CambiarEstadoRequest {
  estado: EstadoReserva;
  mesaId?: number | null;
}

// ---------- Reglas (espejo de EstadoReserva.puedePasarA en la API) ----------

export const TRANSICIONES: Record<EstadoReserva, EstadoReserva[]> = {
  PENDIENTE: ['CONFIRMADA', 'CANCELADA'],
  CONFIRMADA: ['EN_CURSO', 'CANCELADA', 'NO_SHOW'],
  EN_CURSO: ['COMPLETADA'],
  COMPLETADA: [],
  CANCELADA: [],
  NO_SHOW: [],
};

/** Camino feliz que se muestra como paso a paso. */
export const PASOS: { estado: EstadoReserva; titulo: string; descripcion: string }[] = [
  { estado: 'PENDIENTE', titulo: 'Solicitud', descripcion: 'Reserva recibida' },
  { estado: 'CONFIRMADA', titulo: 'Confirmada', descripcion: 'Mesa asignada' },
  { estado: 'EN_CURSO', titulo: 'En curso', descripcion: 'Cliente en el local' },
  { estado: 'COMPLETADA', titulo: 'Completada', descripcion: 'Servicio finalizado' },
];

/** Etiqueta del botón que avanza hacia cada estado. */
export const ACCION_AVANZAR: Partial<Record<EstadoReserva, string>> = {
  CONFIRMADA: 'Confirmar reserva',
  EN_CURSO: 'Registrar llegada del cliente',
  COMPLETADA: 'Completar reserva',
};

export const ETIQUETA_ESTADO: Record<EstadoReserva, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  EN_CURSO: 'En curso',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
  NO_SHOW: 'No asistió',
};

/** Siguiente estado del camino feliz (null si es terminal). */
export function siguientePaso(estado: EstadoReserva): EstadoReserva | null {
  const i = PASOS.findIndex((p) => p.estado === estado);
  return i >= 0 && i < PASOS.length - 1 ? PASOS[i + 1].estado : null;
}