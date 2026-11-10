import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
 
import { RestauranteRequest, RestauranteResponse } from './Restaurante.models';
import { RestauranteService } from '../../services/restaurante-service';

 
/** @NotBlank del backend: no admite cadenas vacías ni solo espacios. */
const noBlank: ValidatorFn = (c) =>
  typeof c.value === 'string' && c.value.trim() === '' ? { required: true } : null;
 
/** LocalTime puede llegar como "09:00:00"; <input type="time"> trabaja con "09:00". */
const hhmm = (t: string) => t.slice(0, 5);

@Component({  
  imports: [ReactiveFormsModule],
  selector: 'app-my-restaurant',
  styleUrl: './my-restaurant.css',
  templateUrl: './my-restaurant.html',
  changeDetection: ChangeDetectionStrategy.OnPush,  
})
export class MyRestaurant implements OnInit {
   private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(RestauranteService);
 
  protected readonly restaurante = signal<RestauranteResponse | null>(null);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly editando = signal(false);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly errorGuardado = signal<string | null>(null);
  protected readonly mensaje = signal<string | null>(null);
 
  /** Sin restaurante → el formulario funciona en modo "crear". */
  protected readonly esNuevo = computed(() => this.restaurante() === null);
  protected readonly mostrarFormulario = computed(() => this.esNuevo() || this.editando());
 
  protected readonly inputCls =
    'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ' +
    'placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 ' +
    '[&.ng-touched.ng-invalid]:border-red-500';
 
  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, noBlank, Validators.maxLength(150)]],
    descripcion: ['', [Validators.maxLength(1000)]],
    direccion: ['', [Validators.required, noBlank, Validators.maxLength(200)]],
    ciudad: ['', [Validators.required, noBlank, Validators.maxLength(100)]],
    latitud: [null as number | null, [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitud: [null as number | null, [Validators.required, Validators.min(-180), Validators.max(180)]],
    telefono: ['', [Validators.maxLength(30)]],
    horaApertura: ['', [Validators.required]],
    horaCierre: ['', [Validators.required]],
    duracionReservaMin: [90 as number | null, [Validators.min(30), Validators.max(480)]],
  });
 
  ngOnInit(): void {
    this.cargar();
  }
 
  protected cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
 
    this.service.obtener().subscribe({
      next: (r) => {
        this.restaurante.set(r);
        if (r) this.rellenarFormulario(r);
        this.cargando.set(false);
      },
      error: () => {
        // No se muestra el formulario de creación si falló la carga, para no duplicar un restaurante existente.
        this.errorCarga.set('No se pudo cargar la información del restaurante.');
        this.cargando.set(false);
      },
    });
  }
 
  protected editar(): void {
    this.mensaje.set(null);
    this.errorGuardado.set(null);
    this.editando.set(true);
  }
 
  protected cancelar(): void {
    const r = this.restaurante();
    if (r) this.rellenarFormulario(r);
    this.errorGuardado.set(null);
    this.editando.set(false);
  }
 
  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    const eraNuevo = this.esNuevo();
    const req = this.construirRequest();
    const peticion$ = eraNuevo ? this.service.crear(req) : this.service.actualizar(req);
 
    this.guardando.set(true);
    this.errorGuardado.set(null);
    this.mensaje.set(null);
 
    peticion$.subscribe({
      next: (r) => {
        this.restaurante.set(r);
        this.rellenarFormulario(r);
        this.editando.set(false);
        this.guardando.set(false);
        this.mensaje.set(eraNuevo ? 'Restaurante creado.' : 'Cambios guardados.');
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.errorGuardado.set(
          err.error?.message ?? 'No se pudo guardar. Revisa los datos e inténtalo de nuevo.',
        );
      },
    });
  }
 
  /** Devuelve el mensaje de error de un control solo si ya fue tocado. */
  protected error(c: AbstractControl): string | null {
    if (!c.invalid || !(c.touched || c.dirty)) return null;
    const e = c.errors ?? {};
    if (e['required']) return 'Este campo es obligatorio.';
    if (e['maxlength']) return `Máximo ${e['maxlength'].requiredLength} caracteres.`;
    if (e['min']) return `El valor mínimo es ${e['min'].min}.`;
    if (e['max']) return `El valor máximo es ${e['max'].max}.`;
    return 'Valor no válido.';
  }
 
  private rellenarFormulario(r: RestauranteResponse): void {
    this.form.reset({
      nombre: r.nombre,
      descripcion: r.descripcion ?? '',
      direccion: r.direccion,
      ciudad: r.ciudad,
      latitud: r.latitud,
      longitud: r.longitud,
      telefono: r.telefono ?? '',
      horaApertura: hhmm(r.horaApertura),
      horaCierre: hhmm(r.horaCierre),
      duracionReservaMin: r.duracionReservaMin,
    });
  }
 
  private construirRequest(): RestauranteRequest {
    const v = this.form.getRawValue();
    return {
      nombre: v.nombre.trim(),
      descripcion: v.descripcion.trim() || null,
      direccion: v.direccion.trim(),
      ciudad: v.ciudad.trim(),
      latitud: v.latitud as number,
      longitud: v.longitud as number,
      telefono: v.telefono.trim() || null,
      horaApertura: v.horaApertura,
      horaCierre: v.horaCierre,
      duracionReservaMin: v.duracionReservaMin,
    };
  }
}
