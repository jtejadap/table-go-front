import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

// Ajusta la ruta a donde tengas tu componente de paginación.
import { Pagination } from '../../../components/pagination/pagination';
import { EstadoReserva, PageResponse, ReservaResponse } from './reserva-model';

const API_MIS_RESERVAS = '/api/reservas/mias';

const ESTADOS: { valor: EstadoReserva; etiqueta: string }[] = [
  { valor: 'PENDIENTE', etiqueta: 'Pendiente' },
  { valor: 'CONFIRMADA', etiqueta: 'Confirmada' },
  { valor: 'COMPLETADA', etiqueta: 'Completada' },
  { valor: 'EN_CURSO', etiqueta: 'En curso' },
  { valor: 'NO_SHOW', etiqueta: 'No show' },
  { valor: 'CANCELADA', etiqueta: 'Cancelada' },
];

/** Clases completas (no concatenadas) para que Tailwind las detecte al compilar. */
const CLASE_ESTADO: Record<EstadoReserva, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  CONFIRMADA: 'bg-green-100 text-green-800',
  COMPLETADA: 'bg-slate-200 text-slate-700',
  EN_CURSO: 'bg-blue-100 text-blue-800',
  CANCELADA: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-gray-100 text-gray-800',
};

/** Estados en los que ya no tiene sentido modificar la reserva. */
const NO_EDITABLES = new Set<EstadoReserva>(['NO_SHOW', 'CANCELADA', 'COMPLETADA']);

const fmtDia = new Intl.DateTimeFormat('es-CO', { day: 'numeric' });
const fmtMes = new Intl.DateTimeFormat('es-CO', { month: 'short' });
const fmtHora = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' });
const fmtLargo = new Intl.DateTimeFormat('es-CO', { weekday: 'long', year: 'numeric' });
const fmtDinero = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

@Component({
  selector: 'app-mis-reservas',
  imports: [RouterLink, Pagination],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block bg-slate-100 px-4 pt-6 pb-12 text-slate-900' },  
  styleUrl: './mis-reservas.css',
  templateUrl: './mis-reservas.html',  
})
export class MisReservas {
   protected readonly estados = ESTADOS;

  // Filtros y paginación (fuente de verdad de la consulta).
  protected readonly estado = signal<EstadoReserva | ''>('');
  protected readonly desde = signal('');
  protected readonly hasta = signal('');
  protected readonly page = signal(0);
  protected readonly size = signal(10);

  protected readonly rangoInvalido = computed(
    () => !!this.desde() && !!this.hasta() && this.desde() > this.hasta(),
  );
  protected readonly hayFiltros = computed(() => !!this.estado() || !!this.desde() || !!this.hasta());

  /** Se vuelve a consultar solo cuando cambia algún signal leído aquí. */
  protected readonly reservas = httpResource<PageResponse<ReservaResponse>>(() => {
    if (this.rangoInvalido()) return undefined; // no consulta con un rango imposible

    const params: Record<string, string | number> = { page: this.page(), size: this.size() };
    if (this.estado()) params['estado'] = this.estado();
    if (this.desde()) params['desde'] = this.desde();
    if (this.hasta()) params['hasta'] = this.hasta();

    return { url: API_MIS_RESERVAS, params };
  });

  /** Conserva la última página cargada mientras llega la siguiente, para evitar parpadeos. */
  protected readonly pagina = linkedSignal<PageResponse<ReservaResponse> | undefined, PageResponse<ReservaResponse> | undefined>({
    source: () => (this.reservas.hasValue() ? this.reservas.value() : undefined),
    computation: (nueva, previa) => nueva ?? previa?.value,
  });

  protected readonly filas = computed(() =>
    (this.pagina()?.content ?? []).map((r) => {
      const fecha = new Date(r.fechaHora);
      return {
        ...r,
        dia: fmtDia.format(fecha),
        mes: fmtMes.format(fecha).replace('.', ''),
        hora: fmtHora.format(fecha),
        diaSemana: fmtLargo.format(fecha),
        totalFmt: fmtDinero.format(r.total),
        claseEstado: CLASE_ESTADO[r.estado] ?? 'bg-slate-200 text-slate-700',
        etiquetaEstado: ESTADOS.find((e) => e.valor === r.estado)?.etiqueta ?? r.estado,
        editable: !NO_EDITABLES.has(r.estado) && fecha.getTime() > Date.now(),
        precios: r.items.map((i) => ({ ...i, subtotalFmt: fmtDinero.format(i.subtotal) })),
      };
    }),
  );

  protected cambiarEstado(valor: string): void {
    this.estado.set(valor as EstadoReserva | '');
    this.page.set(0);
  }

  protected cambiarDesde(valor: string): void {
    this.desde.set(valor);
    this.page.set(0);
  }

  protected cambiarHasta(valor: string): void {
    this.hasta.set(valor);
    this.page.set(0);
  }

  protected limpiarFiltros(): void {
    this.estado.set('');
    this.desde.set('');
    this.hasta.set('');
    this.page.set(0);
  }

  protected irAPagina(p: number): void {
    this.page.set(p);
  }

  protected cambiarTamano(s: number): void {
    this.size.set(s);
    this.page.set(0);
  }
}
