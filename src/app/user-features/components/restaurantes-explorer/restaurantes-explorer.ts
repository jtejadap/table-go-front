import {
  Component, ElementRef, afterNextRender, computed, effect, inject, signal, viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, map, of, switchMap, tap } from 'rxjs';
import * as L from 'leaflet';
import { Restaurante, TablegoApiService } from '../../services/tablego-api-service';
 
type Pos = { lat: number; lng: number };
 
const esc = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
 
function distanciaKm(a: Pos, b: Pos): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

@Component({
 imports: [FormsModule, RouterLink],
  selector: 'app-restaurantes-explorer',
  styleUrl: './restaurantes-explorer.css',
  templateUrl: './restaurantes-explorer.html',
})
export class RestaurantesExplorer {
  private api = inject(TablegoApiService);
  private mapEl = viewChild.required<ElementRef<HTMLDivElement>>('mapEl');
 
  readonly radios = [1, 3, 5, 10, 20];
 
  nombre = signal('');
  cerca = signal(false);
  radioKm = signal(5);
  pos = signal<Pos | null>(null);
  geoError = signal<string | null>(null);
  seleccionadoId = signal<number | null>(null);
  cargando = signal(true);
  error = signal(false);
 
  private query = computed(() => ({
    nombre: this.nombre().trim(),
    pos: this.cerca() ? this.pos() : null,
    radio: this.radioKm(),
  }));
 
  private resultados = toSignal(
    toObservable(this.query).pipe(
      debounceTime(350),
      tap(() => { this.cargando.set(true); this.error.set(false); }),
      switchMap(q =>
        this.api.buscarRestaurantes({
          nombre: q.nombre || undefined,
          lat: q.pos?.lat, lng: q.pos?.lng, radioKm: q.pos ? q.radio : undefined,
          size: 30,
        }).pipe(
          map(p => p.content),
          catchError(() => { this.error.set(true); return of([] as Restaurante[]); }),
        ),
      ),
      tap(() => this.cargando.set(false)),
    ),
    { initialValue: [] as Restaurante[] },
  );
 
  /** Resultados con distancia y ordenados por cercanía cuando hay ubicación. */
  items = computed(() => {
    const p = this.pos();
    const list = this.resultados().map(r => ({
      ...r,
      dist: r.distanciaKm ?? (p ? distanciaKm(p, { lat: r.latitud, lng: r.longitud }) : null),
    }));
    return p ? list.sort((a, b) => (a.dist ?? 0) - (b.dist ?? 0)) : list;
  });
 
  /* ── Mapa ── */
  private map?: L.Map;
  private capa = L.layerGroup();
  private markers = new Map<number, L.Marker>();
  private mapaListo = signal(false);
 
  constructor() {
    afterNextRender(() => {
      this.map = L.map(this.mapEl().nativeElement, { zoomControl: false }).setView([10.4, -75.5], 12);
      L.control.zoom({ position: 'bottomright' }).addTo(this.map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '© OpenStreetMap',
      }).addTo(this.map);
      this.capa.addTo(this.map);
      this.mapaListo.set(true);
      this.localizar(); // pide ubicación al entrar: si la aceptan, ya ve lo más cercano
    });
 
    // Pinta marcadores (y resalta el seleccionado)
    effect(() => {
      if (!this.mapaListo()) return;
      const items = this.items(), sel = this.seleccionadoId(), p = this.pos();
      this.capa.clearLayers();
      this.markers.clear();
 
      for (const r of items) {
        const activo = r.id === sel;
        const m = L.marker([r.latitud, r.longitud], {
          zIndexOffset: activo ? 1000 : 0,
          icon: L.divIcon({
            className: '', iconSize: [0, 0],
            html: `<div class="-translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold shadow ${
              activo ? 'border-teal-900 bg-teal-800 text-white' : 'border-stone-300 bg-white text-stone-800'
            }">${esc(r.nombre)}</div>`,
          }),
        }).on('click', () => this.seleccionar(r, false));
        this.markers.set(r.id, m);
        this.capa.addLayer(m);
      }
 
      if (p) {
        this.capa.addLayer(L.marker([p.lat, p.lng], {
          interactive: false,
          icon: L.divIcon({
            className: '', iconSize: [0, 0],
            html: '<div class="-translate-x-1/2 -translate-y-1/2"><span class="block size-4 rounded-full border-2 border-white bg-blue-600 shadow ring-4 ring-blue-600/25"></span></div>',
          }),
        }));
      }
    });
 
    // Encuadra el mapa cuando cambian los resultados o la ubicación (no al seleccionar)
    effect(() => {
      if (!this.mapaListo()) return;
      const items = this.items(), p = this.pos();
      const pts: L.LatLngTuple[] = items.map(r => [r.latitud, r.longitud]);
      if (p) pts.push([p.lat, p.lng]);
      if (pts.length > 1) this.map!.fitBounds(L.latLngBounds(pts), { padding: [48, 48], maxZoom: 16 });
      else if (pts.length === 1) this.map!.setView(pts[0], 15);
      setTimeout(() => this.map?.invalidateSize());
    });
  }
 
  seleccionar(r: Restaurante, desdeLista: boolean) {
    this.seleccionadoId.set(r.id);
    this.map?.flyTo([r.latitud, r.longitud], Math.max(this.map.getZoom(), 15), { duration: 0.5 });
    if (!desdeLista) {
      document.getElementById('rest-' + r.id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
 
  alternarCerca() {
    if (this.cerca()) { this.cerca.set(false); return; }
    if (this.pos()) this.cerca.set(true);
    else this.localizar();
  }
 
  private localizar() {
    if (!('geolocation' in navigator)) {
      this.geoError.set('Tu navegador no permite usar la ubicación. Busca por nombre.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      p => {
        this.pos.set({ lat: p.coords.latitude, lng: p.coords.longitude });
        this.cerca.set(true);
        this.geoError.set(null);
      },
      () => this.geoError.set('No pudimos ver tu ubicación. Activa el permiso en el navegador o busca por nombre.'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }
}
