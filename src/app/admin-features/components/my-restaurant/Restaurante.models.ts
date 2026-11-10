/** Equivalente a RestauranteDtos.RestauranteRequest. LocalTime viaja como "HH:mm" o "HH:mm:ss". */
export interface RestauranteRequest {
  nombre: string;
  descripcion: string | null;
  direccion: string;
  ciudad: string;
  latitud: number;
  longitud: number;
  telefono: string | null;
  horaApertura: string;
  horaCierre: string;
  duracionReservaMin: number | null;
}

/** Equivalente a RestauranteDtos.RestauranteResponse. */
export interface RestauranteResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  direccion: string;
  ciudad: string;
  latitud: number;
  longitud: number;
  telefono: string | null;
  horaApertura: string;
  horaCierre: string;
  duracionReservaMin: number;
  distanciaKm: number | null;
}