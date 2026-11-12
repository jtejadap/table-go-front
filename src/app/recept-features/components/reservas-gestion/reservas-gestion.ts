import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import { ReservaGestionService } from '../../services/reserva-gestion-service';
import { ReservasStepper } from '../../components/reservas-stepper/reservas-stepper';
import {
  ACCION_AVANZAR,
  ETIQUETA_ESTADO,
  EstadoReserva,
  FiltrosReserva,
  MesaResponse,
  ReservaResponse,
  TRANSICIONES,
  siguientePaso,
} from '../../models/reserva-models';
 
const PAGE_SIZE = 30;
 
/** Menor número = más arriba en la lista. */
const PRIORIDAD: Record<EstadoReserva, number> = {
  PENDIENTE: 0, // nuevas: requieren acción
  EN_CURSO: 1,
  CONFIRMADA: 2,
  COMPLETADA: 3,
  NO_SHOW: 4,
  CANCELADA: 5,
};
 
const ESTILO_ESTADO: Record<EstadoReserva, string> = {
  PENDIENTE: 'border-amber-300 bg-amber-50 text-amber-900',
  CONFIRMADA: 'border-sky-200 bg-sky-50 text-sky-900',
  EN_CURSO: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  COMPLETADA: 'border-stone-200 bg-stone-100 text-stone-600',
  CANCELADA: 'border-rose-200 bg-rose-50 text-rose-800',
  NO_SHOW: 'border-stone-300 bg-stone-100 text-stone-600',
};

@Component({
  imports: [ReactiveFormsModule, ReservasStepper],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-reservas-gestion',
  styleUrl: './reservas-gestion.css',
  templateUrl: './reservas-gestion.html',
})
export class ReservasGestion {
  private readonly api = inject(ReservaGestionService);
  private readonly destroyRef = inject(DestroyRef);
 
  protected readonly estados = Object.keys(ETIQUETA_ESTADO) as EstadoReserva[];
  protected readonly etiqueta = ETIQUETA_ESTADO;
  protected readonly estilo = ESTILO_ESTADO;
  protected readonly accion = ACCION_AVANZAR;
 
  protected readonly form = new FormGroup({
    nombreCliente: new FormControl('', { nonNullable: true }),
    estado: new FormControl<EstadoReserva | ''>('', { nonNullable: true }),
    desde: new FormControl(isoLocal(new Date()), { nonNullable: true }), // por defecto: desde hoy
    hasta: new FormControl('', { nonNullable: true }),
  });
 
  // Lista
  protected readonly reservas = signal<ReservaResponse[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly pagina = signal(0);
  protected readonly totalPaginas = signal(0);
  protected readonly total = signal(0);
  private readonly ahora = signal(Date.now());
 
  // Detalle y acciones
  protected readonly seleccionadaId = signal<number | null>(null);
  protected readonly mesas = signal<MesaResponse[]>([]);
  protected readonly cargandoMesas = signal(false);
  protected readonly mesaId = signal<number | null>(null);
  protected readonly guardando = signal(false);
  protected readonly errorAccion = signal<string | null>(null);
  protected readonly confirmando = signal<'CANCELADA' | 'NO_SHOW' | null>(null);
 
  protected readonly recargar$ = new Subject<void>();
 
  /** Nuevas (PENDIENTE) primero, luego en curso, confirmadas y cerradas; dentro de cada grupo, la más próxima primero. */
  protected readonly ordenadas = computed(() =>
    [...this.reservas()].sort(
      (a, b) =>
        PRIORIDAD[a.estado] - PRIORIDAD[b.estado] ||
        a.fechaHora.localeCompare(b.fechaHora),
    ),
  );
 
  protected readonly pendientes = computed(
    () => this.reservas().filter((r) => r.estado === 'PENDIENTE').length,
  );
 
  protected readonly seleccionada = computed(
    () => this.reservas().find((r) => r.id === this.seleccionadaId()) ?? null,
  );
 
  protected readonly proximo = computed(() => {
    const r = this.seleccionada();
    return r ? siguientePaso(r.estado) : null;
  });
 
  constructor() {
    this.recargar$
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.error.set(null);
        }),
        switchMap(() =>
          this.api.listar(this.form.getRawValue() as FiltrosReserva, this.pagina(), PAGE_SIZE).pipe(
            catchError((e) => {
              this.error.set(mensaje(e, 'No se pudieron cargar las reservas.'));
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((res) => {
        this.cargando.set(false);
        if (!res) return;
        this.reservas.set(res.content);
        this.totalPaginas.set(res.totalPages);
        this.total.set(res.totalElements);
        if (!res.content.some((r) => r.id === this.seleccionadaId())) this.seleccionadaId.set(null);
      });
 
    this.form.valueChanges.pipe(debounceTime(300), takeUntilDestroyed()).subscribe(() => {
      this.pagina.set(0);
      this.recargar$.next();
    });
 
    // Refresca las etiquetas relativas ("en 20 min") cada minuto
    const t = setInterval(() => this.ahora.set(Date.now()), 60_000);
    this.destroyRef.onDestroy(() => clearInterval(t));
 
    this.recargar$.next();
  }
 
  // ---------- Acciones ----------
 
  protected seleccionar(r: ReservaResponse) {
    this.seleccionadaId.set(r.id);
    this.confirmando.set(null);
    this.errorAccion.set(null);
    this.mesaId.set(r.mesaId);
    this.mesas.set([]);
    if (r.estado === 'PENDIENTE') this.cargarMesas(r.numPersonas);
  }
 
  private cargarMesas(capacidadMin: number) {
    this.cargandoMesas.set(true);
    this.api
      .mesas(capacidadMin)
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.cargandoMesas.set(false);
        this.mesas.set((res?.content ?? []).sort((a, b) => a.capacidad - b.capacidad || a.numero - b.numero));
      });
  }
 
  protected cambiar(destino: EstadoReserva) {
    const r = this.seleccionada();
    if (!r || this.guardando()) return;
    this.guardando.set(true);
    this.errorAccion.set(null);
 
    this.api
      .cambiarEstado(r.id, { estado: destino, mesaId: destino === 'CONFIRMADA' ? this.mesaId() : null })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (nueva) => {
          this.guardando.set(false);
          this.confirmando.set(null);
          this.reservas.update((lista) => lista.map((x) => (x.id === nueva.id ? nueva : x)));
        },
        error: (e) => {
          this.guardando.set(false);
          this.errorAccion.set(mensaje(e, 'No se pudo cambiar el estado.'));
        },
      });
  }
 
  protected puede(r: ReservaResponse, destino: EstadoReserva): boolean {
    return TRANSICIONES[r.estado].includes(destino);
  }
 
  protected irA(p: number) {
    this.pagina.set(p);
    this.recargar$.next();
  }
 
  protected rango(tipo: 'hoy' | 'semana' | 'todas') {
    const hoy = new Date();
    const fin = new Date();
    fin.setDate(hoy.getDate() + 7);
    this.form.patchValue(
      tipo === 'hoy'
        ? { desde: isoLocal(hoy), hasta: isoLocal(hoy) }
        : tipo === 'semana'
          ? { desde: isoLocal(hoy), hasta: isoLocal(fin) }
          : { desde: '', hasta: '' },
    );
  }
 
  // ---------- Presentación ----------
 
  protected itemClase(r: ReservaResponse): string {
    const base =
      r.estado === 'PENDIENTE'
        ? 'border-l-amber-500 bg-amber-50/40'
        : r.estado === 'EN_CURSO'
          ? 'border-l-emerald-500'
          : 'border-l-transparent';
    const sel = r.id === this.seleccionadaId() ? ' bg-stone-100' : '';
    const cerrada = PRIORIDAD[r.estado] >= 3 ? ' text-stone-500' : '';
    return base + sel + cerrada;
  }
 
  protected cuando(iso: string): string {
    const d = new Date(iso);
    const hoy = new Date(this.ahora());
    const dif = Math.round((startOfDay(d) - startOfDay(hoy)) / 86_400_000);
    const hora = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
    if (dif === 0) return `Hoy ${hora}`;
    if (dif === 1) return `Mañana ${hora}`;
    if (dif === -1) return `Ayer ${hora}`;
    const fecha = new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
    return `${fecha} ${hora}`;
  }
 
  /** Solo dentro de ±24 h, para no saturar la lista. */
  protected relativo(iso: string): string | null {
    const min = Math.round((new Date(iso).getTime() - this.ahora()) / 60_000);
    const abs = Math.abs(min);
    if (abs >= 1440) return null;
    const txt = abs < 60 ? `${abs} min` : `${Math.round(abs / 60)} h`;
    return min >= 0 ? `en ${txt}` : `hace ${txt}`;
  }
 
  protected dinero(v: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
  }
}
 
// ---------- utilidades ----------
 
function isoLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
 
function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}
 
/** Ajusta a la forma de error que devuelva tu API (BusinessRuleException / ResourceNotFoundException). */
function mensaje(e: unknown, porDefecto: string): string {
  if (e instanceof HttpErrorResponse) {
    return e.error?.message ?? e.error?.detail ?? e.error?.error ?? porDefecto;
  }
  return porDefecto;
}
