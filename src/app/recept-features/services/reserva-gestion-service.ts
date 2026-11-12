import { HttpClient, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CambiarEstadoRequest,
  FiltrosReserva,
  MesaResponse,
  PageResponse,
  ReservaResponse,
} from '../models/reserva-models';

@Service()
export class ReservaGestionService {
    private readonly http = inject(HttpClient);
    private readonly base = '/api/gestion/reservas';
    
    listar(f: FiltrosReserva, page: number, size: number): Observable<PageResponse<ReservaResponse>> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (f.estado) params = params.set('estado', f.estado);
        if (f.desde) params = params.set('desde', f.desde);
        if (f.hasta) params = params.set('hasta', f.hasta);
        if (f.nombreCliente.trim()) params = params.set('nombreCliente', f.nombreCliente.trim());
        return this.http.get<PageResponse<ReservaResponse>>(this.base, { params });
    }
    
    mesas(capacidadMin: number): Observable<PageResponse<MesaResponse>> {
        const params = new HttpParams()
        .set('capacidadMin', capacidadMin)
        .set('activa', true)
        .set('page', 0)
        .set('size', 100);
        return this.http.get<PageResponse<MesaResponse>>(`${this.base}/mesas`, { params });
    }
    
    cambiarEstado(id: number, body: CambiarEstadoRequest): Observable<ReservaResponse> {
        return this.http.patch<ReservaResponse>(`${this.base}/${id}/estado`, body);
    }
}
