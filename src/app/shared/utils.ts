import { HttpErrorResponse, HttpParams } from '@angular/common/http';
 
/** Respuesta paginada del backend (PageResponse<T>). Ajusta los nombres si tu DTO difiere. */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
 
/** Construye HttpParams ignorando valores nulos, indefinidos o vacíos. */
export function buildParams(values: Record<string, string | number | boolean | null | undefined>): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== null && value !== undefined && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}
 
/** Extrae un mensaje legible de un error HTTP. */
export function errorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'No se pudo conectar con el servidor.';
    if (err.status === 403) return 'No tienes permisos para realizar esta acción.';
    const body = err.error;
    if (typeof body === 'string' && body) return body;
    if (body?.message) return body.message;
    if (body?.detail) return body.detail;
  }
  return 'Ocurrió un error inesperado.';
}