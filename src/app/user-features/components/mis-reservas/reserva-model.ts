/** Refleja com.tablego.api.model.EstadoReserva. Ajusta los valores a los de tu enum. */
export type EstadoReserva =  'PENDIENTE' | 'CONFIRMADA' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA' | 'NO_SHOW';

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
  /** LocalDateTime de Java, sin zona horaria: "2026-11-20T20:30:00". */
  fechaHora: string;
  numPersonas: number;
  estado: EstadoReserva;
  notas: string | null;
  items: ItemResponse[];
  total: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}