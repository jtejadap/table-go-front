import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService, UserResponse } from '../../services/users-service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-users-admin',
  styleUrl: './users-admin.css',
  templateUrl: './users-admin.html',
})
export class UsersAdmin {
   private readonly api = inject(UsersService);
  private readonly fb = inject(FormBuilder).nonNullable;
 
  readonly users = signal<UserResponse[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
 
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly showPassword = signal(false);
 
  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
  });
 
  ngOnInit(): void {
    this.load();
  }
 
  load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.api.list().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.loadError.set(this.messageFrom(err, 'No se pudo cargar la lista de usuarios.'));
        this.loading.set(false);
      },
    });
  }
 
  submit(): void {
    this.formError.set(null);
    this.success.set(null);
 
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    this.saving.set(true);
    this.api.createRecepcionist(this.form.getRawValue()).subscribe({
      next: (created) => {
        this.users.update((list) => [...list, created]);
        this.success.set(`Se creó la cuenta de ${created.nombre}.`);
        this.form.reset();
        this.saving.set(false);
      },
      error: (err) => {
        this.formError.set(this.messageFrom(err, 'No se pudo crear el usuario.'));
        this.saving.set(false);
      },
    });
  }
 
  invalid(name: 'nombre' | 'email' | 'password'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }
 
  roleLabel(role: string): string {
    switch (role) {
      case 'ADMINISTRADOR': return 'Administrador';
      case 'RECEPCIONISTA': return 'Recepcionista';
      default: return role;
    }
  }
 
  /** Extrae el mensaje del backend (409, 400, etc.) o usa uno por defecto. */
  private messageFrom(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) return 'No hay conexión con el servidor.';
      if (err.status === 403) return 'No tienes permisos de administrador para esta acción.';
      const body = err.error;
      if (typeof body === 'string' && body.trim()) return body;
      if (body?.message) return body.message;
      if (body?.detail) return body.detail;
    }
    return fallback;
  }
}
