import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input, numberAttribute, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EMPTY, filter, forkJoin, switchMap } from 'rxjs';
import { ItemRequest, Producto, ReservaResponse, TablegoApiService } from '../../services/tablego-api-service';
 
/** Estados en los que el cliente aún puede cambiar su pedido (el backend es quien decide en última instancia). */
const ESTADOS_EDITABLES = ['PENDIENTE', 'CONFIRMADA'];
 
type Linea = { producto: Producto; cantidad: number; nota: string; subtotal: number };

@Component({
  imports: [FormsModule, RouterLink, CurrencyPipe, DatePipe],
  selector: 'app-reserva-flow',
  styleUrl: './reserva-flow.css',
  templateUrl: './reserva-flow.html',
})
export class ReservaFlow {
  private api = inject(TablegoApiService);
 
  /** Ruta: /restaurantes/:id  ·  Opcional: ?reserva=123 para retomar y modificar una reserva existente. */
  id = input<number | undefined>(undefined, { 
    transform: (v: unknown) => (v == null ? undefined : numberAttribute(v)) 
  });
  reserva = input(undefined, { transform: (v: unknown) => (v == null ? undefined : numberAttribute(v)) });
 
  datos = rxResource({
  params: () => {
    const restaurantId = this.id();
    // Si todavía no hay un ID disponible (primer ciclo de render), no dispares las peticiones
    return restaurantId ? { id: restaurantId } : undefined;
  },
  stream: ({ params }) => {
    if (!params) return EMPTY;
    return forkJoin({ 
      rest: this.api.restaurante(params.id), 
      menu: this.api.menu(params.id) 
    });
  },
});
 
  /* ── Formulario de reserva ── */
  readonly hoy = new Date().toLocaleDateString('sv-SE'); // yyyy-MM-dd en hora local
  fecha = signal('');
  hora = signal('');
  personas = signal(2);
  notas = signal('');
 
  /* ── Estado ── */
  private cart = signal<Record<number, { cantidad: number; nota: string }>>({});
  reservaActual = signal<ReservaResponse | null>(null);
  private pedidoGuardado = signal('[]');
  enviando = signal(false);
  confirmandoCancelar = signal(false);
  mensaje = signal<{ ok: boolean; texto: string } | null>(null);
 
  /* ── Derivados ── */
 grupos = computed(() => {
    const data = this.datos.value();
    // Aseguramos que menu sea un array, incluso si data o menu aún no existen
    const menu = this.datos.value()?.menu?.content ?? [];
    
    const map = new Map<string, Producto[]>();
    for (const p of menu) {
      const k = p.categoria || 'Menú';
      map.set(k, [...(map.get(k) ?? []), p]);
    }
    return [...map].map(([nombre, productos]) => ({ nombre, productos }));
  });
 
 lineas = computed<Linea[]>(() => {
    const c = this.cart();
    const menu = this.datos.value()?.menu?.content ?? []; 

    return menu
      .filter(p => (c[p.id]?.cantidad ?? 0) > 0)
      .map(p => ({ producto: p, cantidad: c[p.id].cantidad, nota: c[p.id].nota, subtotal: p.precio * c[p.id].cantidad }));
  });

  total = computed(() => this.lineas().reduce((s, l) => s + l.subtotal, 0));
  unidades = computed(() => this.lineas().reduce((s, l) => s + l.cantidad, 0));
 
  editable = computed(() => {
    const r = this.reservaActual();
    return !r || ESTADOS_EDITABLES.includes(r.estado);
  });
  hayCambios = computed(() => this.serializar(this.lineas()) !== this.pedidoGuardado());
 
  /** Horarios cada 30 min dentro del horario del restaurante (sin horas pasadas si es hoy). */
  horas = computed(() => {
    const rest = this.datos.value()?.rest;
    if (!rest || !this.fecha()) return [];
    const toMin = (s: string) => +s.slice(0, 2) * 60 + +s.slice(3, 5);
    const ahora = new Date();
    const esHoy = this.fecha() === this.hoy;
    const minAhora = ahora.getHours() * 60 + ahora.getMinutes();
    const out: string[] = [];
    for (let m = toMin(rest.horaApertura); m <= toMin(rest.horaCierre); m += 30) {
      if (esHoy && m <= minAhora) continue;
      out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
    }
    return out;
  });
 
  formValido = computed(() => !!this.fecha() && !!this.hora() && this.personas() >= 1 && this.personas() <= 50);
 
  constructor() {
    // Si cambia la fecha y la hora elegida ya no aplica, la limpiamos
    toObservable(this.horas).pipe(takeUntilDestroyed()).subscribe(hs => {
      if (this.hora() && !hs.includes(this.hora())) this.hora.set('');
    });
 
    // Retomar una reserva existente
    toObservable(this.reserva).pipe(
      filter((id): id is number => id !== undefined),
      switchMap(id => this.api.reserva(id)),
      takeUntilDestroyed(),
    ).subscribe({
      next: r => this.cargarReserva(r),
      error: () => this.mensaje.set({ ok: false, texto: 'No encontramos esa reserva.' }),
    });
  }
 
  /* ── Carrito ── */
  cantidad(productoId: number) { return this.cart()[productoId]?.cantidad ?? 0; }
 
  cambiar(productoId: number, delta: number) {
    this.cart.update(c => {
      const actual = c[productoId] ?? { cantidad: 0, nota: '' };
      const cantidad = Math.min(50, Math.max(0, actual.cantidad + delta));
      const { [productoId]: _, ...resto } = c;
      return cantidad === 0 ? resto : { ...resto, [productoId]: { ...actual, cantidad } };
    });
    this.mensaje.set(null);
  }
 
  setNota(productoId: number, nota: string) {
    this.cart.update(c => (c[productoId] ? { ...c, [productoId]: { ...c[productoId], nota } } : c));
  }
 
  /* ── Acciones ── */
  reservar(restauranteId: number) {
    if (!this.formValido()) return;
    this.enviando.set(true);
    this.mensaje.set(null);
    this.api.crearReserva({
      restauranteId,
      fechaHora: `${this.fecha()}T${this.hora()}:00`,
      numPersonas: this.personas(),
      notas: this.notas().trim() || null,
      items: this.items(),
    }).subscribe({
      next: r => { this.cargarReserva(r); this.mensaje.set({ ok: true, texto: '¡Reserva creada! Puedes ajustar tu pedido cuando quieras.' }); },
      error: e => this.fallo(e),
    });
  }
 
  guardarPedido() {
    const r = this.reservaActual();
    if (!r) return;
    this.enviando.set(true);
    this.mensaje.set(null);
    this.api.actualizarPedido(r.id, this.items()).subscribe({
      next: res => { this.cargarReserva(res); this.mensaje.set({ ok: true, texto: 'Pedido guardado.' }); },
      error: e => this.fallo(e),
    });
  }
 
  cancelar() {
    const r = this.reservaActual();
    if (!r) return;
    this.enviando.set(true);
    this.api.cancelarReserva(r.id).subscribe({
      next: res => {
        this.cargarReserva(res);
        this.confirmandoCancelar.set(false);
        this.mensaje.set({ ok: true, texto: 'Reserva cancelada.' });
      },
      error: e => { this.confirmandoCancelar.set(false); this.fallo(e); },
    });
  }
 
  /* ── helpers ── */
  private items(): ItemRequest[] {
    return this.lineas().map(l => ({ productoId: l.producto.id, cantidad: l.cantidad, nota: l.nota.trim() || null }));
  }
 
  private serializar(lineas: Linea[]) {
    return JSON.stringify(lineas.map(l => [l.producto.id, l.cantidad, l.nota.trim()]));
  }
 
  private cargarReserva(r: ReservaResponse) {
    this.reservaActual.set(r);
    this.enviando.set(false);
    const cart: Record<number, { cantidad: number; nota: string }> = {};
    for (const i of r.items) cart[i.productoId] = { cantidad: i.cantidad, nota: i.nota ?? '' };
    this.cart.set(cart);
    this.pedidoGuardado.set(JSON.stringify(r.items.map(i => [i.productoId, i.cantidad, (i.nota ?? '').trim()])));
  }
 
  private fallo(e: any) {
    this.enviando.set(false);
    this.mensaje.set({
      ok: false,
      texto: e?.error?.message ?? e?.error?.detail ?? 'No pudimos completar la acción. Intenta de nuevo.',
    });
  }
}
