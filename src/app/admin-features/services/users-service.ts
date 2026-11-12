import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
 
export type Role = 'ADMINISTRADOR' | 'RECEPCIONISTA' | string;
 
export interface UserResponse {
  id: number;
  nombre: string;
  email: string;
  role: Role;
  activo: boolean;
}
 
export interface CreateUserRequest {
  nombre: string;
  email: string;
  password: string;
  role: Role;
}

@Service()
export class UsersService {
    private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/admin/usuarios';
 
  list(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.baseUrl);
  }
 
  createRecepcionist(
    data: Omit<CreateUserRequest, 'role'>,
  ): Observable<UserResponse> {
    const body: CreateUserRequest = { ...data, role: 'RECEPCIONISTA' };
    return this.http.post<UserResponse>(this.baseUrl, body);
  }
}
