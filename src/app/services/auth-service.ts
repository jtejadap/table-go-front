import { Service, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// TODO: mueve esto a tu environment
const API_URL = '/api';

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  role: string;
  activo: boolean;
}

export interface LoginRequest {
  email: string;
  passwclsord: string;
}

// Respuesta exacta de tu API
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number; // segundos
  user: AuthUser;
}

// Página principal de cada rol (ajusta los nombres de rol y rutas a los tuyos)
const ROLE_HOME: Record<string, string> = {
  ADMINISTRADOR: '/admin',
  RECEPCIONISTA: '/recepcion',
  CLIENTE: '/inicio',
};

@Service()
export class AuthService {
  private http = inject(HttpClient);

  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';
  private readonly expKey = 'auth_expires_at';

  public isAuthenticated = signal<boolean>(this.hasValidToken());
  public currentUser = signal<AuthUser | null>(this.readUser());

  // ---------- Login contra la API ----------
  public login(credentials :any): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_URL}/auth/login`, credentials) // TODO: tu endpoint real
      .pipe(tap((res) => this.setSession(res)));
  }

  public setSession(res: LoginResponse): void {
    localStorage.setItem(this.tokenKey, res.accessToken);
    localStorage.setItem(this.userKey, JSON.stringify(res.user));
    localStorage.setItem(this.expKey, String(Date.now() + res.expiresIn * 1000));
    this.currentUser.set(res.user);
    this.isAuthenticated.set(true);
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.expKey);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  // Sesión válida = hay token y no ha expirado
  public isLoggedIn(): boolean {
    if (!this.hasValidToken()) {
      if (this.getToken()) this.logout(); // token vencido: limpiar
      return false;
    }
    return true;
  }

  // ---------- Roles ----------
  public getUserRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];

    const payload = this.decodePayload(token);
    let roles: string[] = payload?.roles ?? (payload?.role ? [payload.role] : []);

    // Respaldo: el objeto user que devuelve el login
    if (!roles.length && this.currentUser()?.role) {
      roles = [this.currentUser()!.role];
    }
    return roles.map((r) => String(r).toUpperCase());
  }

  public hasRole(allowedRoles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return allowedRoles.some((role) => userRoles.includes(role.toUpperCase()));
  }

  // Ruta principal según el rol del usuario
  public getHomeRoute(): string {
    for (const role of this.getUserRoles()) {
      if (ROLE_HOME[role]) return ROLE_HOME[role];
    }
    return '/unauthorized';
  }

  // ---------- Helpers privados ----------
  private hasValidToken(): boolean {
    if (!localStorage.getItem(this.tokenKey)) return false;
    const exp = Number(localStorage.getItem(this.expKey));
    return !exp || Date.now() < exp;
  }

  private readUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(this.userKey);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  // JWT usa base64url (- y _ sin padding): atob() directo puede fallar
  private decodePayload(token: string): any | null {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    } catch (error) {
      console.error('Error al decodificar el token JWT', error);
      return null;
    }
  }
}
