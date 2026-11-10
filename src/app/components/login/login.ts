import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({  
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
  
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  // false = panel de login | true = panel de registro
  isSignUp = signal(false);
  loading = signal(false);
  errorMsg = signal('');
  signupMsg = signal('');

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  signupForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMsg.set('Ingresa un email y una contraseña válidos.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login(this.loginForm.getRawValue()).subscribe({
      next: (res) => {
        this.loading.set(false);

        if (!res.user.activo) {
          this.auth.logout();
          this.errorMsg.set('Tu cuenta está desactivada.');
          return;
        }
        // Redirige a la página principal según el rol
        this.router.navigateByUrl(this.auth.getHomeRoute());
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMsg.set(
          err.status === 401 || err.status === 403
            ? 'Email o contraseña incorrectos.'
            : 'No se pudo conectar con el servidor.'
        );
      },
    });
  }

  onSignUp(): void {
    // TODO: conectar con tu endpoint de registro cuando lo tengas
    this.signupMsg.set('El registro aún no está disponible.');
  }
}
