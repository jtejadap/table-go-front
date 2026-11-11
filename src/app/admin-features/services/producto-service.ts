import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse, buildParams } from '../../shared/utils';

export const CATEGORIAS = ['ENTRADA', 'PLATO_FUERTE', 'BEBIDA', 'POSTRE'] as const;
export type CategoriaProducto = (typeof CATEGORIAS)[number];
 
export interface ProductoRequest {
  nombre: string;
  descripcion?: string | null;
  precio: number;
  categoria: CategoriaProducto;
  disponible?: boolean;
}
 
export interface ProductoResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  categoria: CategoriaProducto;
  disponible: boolean;
}

@Service()
export class ProductoService {
    private readonly http = inject(HttpClient);
    private readonly url = '/api/admin/productos';
    
    listar(
        nombre: string | null,
        categoria: CategoriaProducto | null,
        disponible: boolean | null,
        page: number,
        size: number,
    ): Observable<PageResponse<ProductoResponse>> {
        return this.http.get<PageResponse<ProductoResponse>>(this.url, {
        params: buildParams({ nombre, categoria, disponible, page, size }),
        });
    }
    
    crear(req: ProductoRequest): Observable<ProductoResponse> {
        return this.http.post<ProductoResponse>(this.url, req);
    }
    
    actualizar(id: number, req: ProductoRequest): Observable<ProductoResponse> {
        return this.http.put<ProductoResponse>(`${this.url}/${id}`, req);
    }
    
    cambiarDisponibilidad(id: number, valor: boolean): Observable<ProductoResponse> {
        return this.http.patch<ProductoResponse>(`${this.url}/${id}/disponibilidad`, null, {
        params: buildParams({ valor }),
        });
    }
    
    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.url}/${id}`);
    }
}
