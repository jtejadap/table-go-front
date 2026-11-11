import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
 
/* ───────── Modelos (ajusta los nombres si tu API difiere) ───────── */
 
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
 
export interface Restaurante {
  id: number;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  ciudad?: string;
  latitud: number;
  longitud: number;
  horaApertura: string; // 'HH:mm' o 'HH:mm:ss'
  horaCierre: string;
  duracionReservaMin?: number;
  distanciaKm?: number; // opcional: si el backend lo calcula
}
 
export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria?: string;
  disponible: boolean;
}
 
export interface ItemRequest {
  productoId: number;
  cantidad: number;
  nota?: string | null;
}
 
export interface CrearReservaRequest {
  restauranteId: number;
  fechaHora: string; // 'yyyy-MM-ddTHH:mm:ss'
  numPersonas: number;
  notas?: string | null;
  items: ItemRequest[];
}
 
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
  fechaHora: string;
  numPersonas: number;
  estado: string;
  notas: string | null;
  items: ItemResponse[];
  total: number;
}
 
export interface BuscarRestaurantesParams {
  nombre?: string;
  ciudad?: string;
  lat?: number;
  lng?: number;
  radioKm?: number;
  page?: number;
  size?: number;
}

@Service()
export class TablegoApiService {
    private http = inject(HttpClient);
    private base = '/api';
    
    buscarRestaurantes(p: BuscarRestaurantesParams): Observable<PageResponse<Restaurante>> {
        let params = new HttpParams();
        for (const [k, v] of Object.entries(p)) {
        if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
        }
        return this.http.get<PageResponse<Restaurante>>(`${this.base}/restaurantes`, { params });
    }
    
    restaurante(id: number) {
        return this.http.get<Restaurante>(`${this.base}/restaurantes/${id}`);
    }
    
    /** ⚠️ Este endpoint no estaba en los archivos adjuntos: ajusta la ruta a la real. */
    menu(restauranteId: number) {
        return this.http.get<PageResponse<Producto>>(`${this.base}/restaurantes/${restauranteId}/productos`);
    }
    
    crearReserva(req: CrearReservaRequest) {
        return this.http.post<ReservaResponse>(`${this.base}/reservas`, req);
    }
    
    reserva(id: number) {
        return this.http.get<ReservaResponse>(`${this.base}/reservas/${id}`);
    }
    
    actualizarPedido(id: number, items: ItemRequest[]) {
        return this.http.put<ReservaResponse>(`${this.base}/reservas/${id}/pedido`, { items });
    }
    
    cancelarReserva(id: number) {
        return this.http.patch<ReservaResponse>(`${this.base}/reservas/${id}/cancelar`, {});
    }
}
