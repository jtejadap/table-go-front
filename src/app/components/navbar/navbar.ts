import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { NAV_BY_ROLE } from './nav-items';

const THEME_KEY = 'theme';
const DESKTOP_QUERY = '(min-width: 1024px)'; // = breakpoint `lg` de Tailwind

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  readonly brand = input('TableGo');
  readonly avatar = input('images/perfil.png');

  /**
   * Estado del botón de menú ([(toggled)]).
   * - Móvil/tablet: true = sidebar abierto.
   * - Escritorio (lg+): true = sidebar reducido (solo iconos).
   */
  readonly toggled = model(false);

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  protected readonly user = this.auth.currentUser;

  // Leer currentUser() crea la dependencia reactiva: se recalcula al iniciar/cerrar sesión
  protected readonly sections = computed(() => {
    this.auth.currentUser();
    const role = this.auth.getUserRoles().find((r) => r in NAV_BY_ROLE);
    return role ? NAV_BY_ROLE[role] : [];
  });

  protected readonly homeRoute = computed(() => {
    this.auth.currentUser();
    return this.auth.getHomeRoute();
  });

  protected readonly isDark = signal(this.readStoredTheme());

  /** Clases base de cada enlace/botón del sidebar. El estado activo usa aria-current (lo pone routerLinkActive). */
  protected readonly linkClass =
    'relative grid cursor-pointer grid-cols-[repeat(2,max-content)] items-center gap-x-4 pl-8 text-left ' +
    'text-slate-500 transition-colors hover:text-[#243B55] dark:text-slate-400 dark:hover:text-white ' +
    'max-[360px]:grid-cols-[max-content] max-[360px]:px-8 ' +
    'aria-[current=page]:text-[#243B55] dark:aria-[current=page]:text-white ' +
    'aria-[current=page]:after:absolute aria-[current=page]:after:left-0 aria-[current=page]:after:h-5 ' +
    'aria-[current=page]:after:w-[3px] aria-[current=page]:after:bg-[#243B55] ' +
    'dark:aria-[current=page]:after:bg-white aria-[current=page]:after:content-[""]';

  constructor() {
    // Tailwind (darkMode "class"): se activa con la clase `dark` en <html>
    effect(() => {
      const dark = this.isDark();
      this.document.documentElement.classList.toggle('dark', dark);
      try {
        localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
      } catch {
        /* localStorage no disponible */
      }
    });
  }

  protected toggleSidebar(): void {
    this.toggled.update((v) => !v);
  }

  protected toggleTheme(): void {
    this.isDark.update((v) => !v);
  }

  /** En móvil/tablet cierra el menú al navegar */
  protected onNavigate(): void {
    const isDesktop = this.document.defaultView?.matchMedia(DESKTOP_QUERY).matches ?? true;
    if (!isDesktop) this.toggled.set(false);
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  private readStoredTheme(): boolean {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  }
}
