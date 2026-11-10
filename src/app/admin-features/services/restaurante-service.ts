import { Service } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';
import { RestauranteRequest, RestauranteResponse } from '../components/my-restaurant/Restaurante.models';

@Service()
export class RestauranteService {
    private readonly http = inject(HttpClient);
 
    // Ajusta el prefijo si usas una URL base distinta (p. ej. environment.apiUrl).
    private readonly url = '/api/admin/restaurante';
    
    /**
     * GET: devuelve el restaurante del administrador autenticado.
     * Si el backend responde 422 (o cuerpo vacío) se interpreta como "aún no tiene restaurante" y emite null.
     */
    obtener(): Observable<RestauranteResponse | null> {
        return this.http.get<RestauranteResponse | null>(this.url).pipe(
        catchError((err: HttpErrorResponse) =>
            err.status === 422 ? of(null) : throwError(() => err),
        ),
        );
    }
    
    /** POST: crea el restaurante (responde 201). */
    crear(req: RestauranteRequest): Observable<RestauranteResponse> {
        return this.http.post<RestauranteResponse>(this.url, req);
    }
    
    /** PUT: actualiza el restaurante existente. */
    actualizar(req: RestauranteRequest): Observable<RestauranteResponse> {
        return this.http.put<RestauranteResponse>(this.url, req);
    }
}
