import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse, buildParams } from '../../shared/utils';
 
export interface MesaRequest {
  numero: number;
  capacidad: number;
  activa?: boolean;
}
 
export interface MesaResponse {
  id: number;
  numero: number;
  capacidad: number;
  activa: boolean;
}

@Service()
export class MesaService {
    private readonly http = inject(HttpClient);
    private readonly url = '/api/admin/mesas';
    
    listar(capacidadMin: number | null, activa: boolean | null, page: number, size: number): Observable<PageResponse<MesaResponse>> {
        return this.http.get<PageResponse<MesaResponse>>(this.url, {
        params: buildParams({ capacidadMin, activa, page, size }),
        });
    }
    
    crear(req: MesaRequest): Observable<MesaResponse> {
        return this.http.post<MesaResponse>(this.url, req);
    }
    
    actualizar(id: number, req: MesaRequest): Observable<MesaResponse> {
        return this.http.put<MesaResponse>(`${this.url}/${id}`, req);
    }
    
    desactivar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.url}/${id}`);
    }
}
