import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Datos de un tipo de reserva (grupos de 2, 4 o 6 personas). */
export interface GrupoRequest {
  ticketPorPersona: number;
  duracionHoras: number;
  demandaMaxima: number;
}

/** Datos que el administrador llena en el formulario. */
export interface OptimizacionRequest {
  aforo: number;
  horasFuncionamiento: number;
  eficiencia: number;
  mesasDeSeis: number;
  costoVariable: number;
  costosFijos: number;
  proteinaDisponibleKg: number;
  consumoProteinaKg: number;
  reservasConfirmadasDeSeis: number;
  grupo2: GrupoRequest;
  grupo4: GrupoRequest;
  grupo6: GrupoRequest;
}

/** Estado de una restricción en la solución óptima. */
export interface RestriccionResponse {
  codigo: string;
  descripcion: string;
  unidad: string;
  usado: number;
  limite: number;
  saturada: boolean;
}

/** Resultado que devuelve el modelo de optimización. */
export interface OptimizacionResponse {
  estado: string;
  solucionOptima: boolean;
  reservas2: number;
  reservas4: number;
  reservas6: number;
  personasAtendidas: number;
  contribucion: number;
  costosFijos: number;
  utilidadNeta: number;
  restricciones: RestriccionResponse[];
  mensaje: string;
}

@Service()
export class OptimizacionService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/admin/optimizacion/reservas';

  optimizar(req: OptimizacionRequest): Observable<OptimizacionResponse> {
    return this.http.post<OptimizacionResponse>(this.url, req);
  }
}