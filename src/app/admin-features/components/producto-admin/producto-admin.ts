import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pagination } from '../../../components/pagination/pagination';
import { PageResponse, errorMessage } from '../../../shared/utils';
import { CATEGORIAS, CategoriaProducto, ProductoResponse, ProductoService } from '../../services/producto-service';

@Component({
  imports: [ReactiveFormsModule, CurrencyPipe, Pagination],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-producto-admin',
  styleUrl: './producto-admin.css',
  templateUrl: './producto-admin.html',
})
export class ProductoAdmin {
  private readonly service = inject(ProductoService);
  private readonly fb = inject(FormBuilder).nonNullable;
 
  readonly categorias = CATEGORIAS;
 
  readonly data = signal<PageResponse<ProductoResponse> | null>(null);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly formOpen = signal(false);
  readonly editingId = signal<number | null>(null);
 
  readonly filtros = this.fb.group({
    nombre: [''],
    categoria: [''],
    disponible: [''],
  });
 
  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    descripcion: ['', [Validators.maxLength(500)]],
    precio: [null as number | null, [Validators.required, Validators.min(0.01), Validators.pattern(/^\d{1,10}(\.\d{1,2})?$/)]],
    categoria: ['' as CategoriaProducto | '', [Validators.required]],
    disponible: [true],
  });
 
  ngOnInit(): void {
    this.cargar();
  }
 
  etiqueta(c: string): string {
    const texto = c.replaceAll('_', ' ').toLowerCase();
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
 
  cargar(): void {
    const { nombre, categoria, disponible } = this.filtros.getRawValue();
    this.loading.set(true);
    this.service
      .listar(
        nombre.trim() || null,
        (categoria || null) as CategoriaProducto | null,
        disponible === '' ? null : disponible === 'true',
        this.page(),
        this.size(),
      )
      .subscribe({
        next: (res) => {
          this.data.set(res);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(errorMessage(err));
          this.loading.set(false);
        },
      });
  }
 
  buscar(): void {
    this.page.set(0);
    this.cargar();
  }
 
  limpiar(): void {
    this.filtros.reset();
    this.buscar();
  }
 
  irAPagina(p: number): void {
    this.page.set(p);
    this.cargar();
  }
 
  cambiarTamano(s: number): void {
    this.size.set(s);
    this.buscar();
  }
 
  nuevo(): void {
    this.editingId.set(null);
    this.form.reset({ nombre: '', descripcion: '', precio: null, categoria: '', disponible: true });
    this.formOpen.set(true);
  }
 
  editar(p: ProductoResponse): void {
    this.editingId.set(p.id);
    this.form.reset({
      nombre: p.nombre,
      descripcion: p.descripcion ?? '',
      precio: p.precio,
      categoria: p.categoria,
      disponible: p.disponible,
    });
    this.formOpen.set(true);
  }
 
  cancelar(): void {
    this.formOpen.set(false);
    this.editingId.set(null);
  }
 
  invalid(name: 'nombre' | 'precio' | 'categoria'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }
 
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const req = {
      nombre: raw.nombre.trim(),
      descripcion: raw.descripcion.trim() || null,
      precio: raw.precio!,
      categoria: raw.categoria as CategoriaProducto,
      disponible: raw.disponible,
    };
    const id = this.editingId();
 
    this.saving.set(true);
    this.error.set(null);
    const request$ = id === null ? this.service.crear(req) : this.service.actualizar(id, req);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.cancelar();
        this.cargar();
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.saving.set(false);
      },
    });
  }
 
  alternarDisponibilidad(p: ProductoResponse): void {
    this.error.set(null);
    this.service.cambiarDisponibilidad(p.id, !p.disponible).subscribe({
      next: (actualizado) =>
        this.data.update((d) =>
          d ? { ...d, content: d.content.map((x) => (x.id === actualizado.id ? actualizado : x)) } : d,
        ),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }
 
  eliminar(p: ProductoResponse): void {
    if (!confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return;
    this.error.set(null);
    this.service.eliminar(p.id).subscribe({
      next: () => {
        // Si era el último elemento de la página, retrocede una página.
        if ((this.data()?.content.length ?? 0) === 1 && this.page() > 0) {
          this.page.update((n) => n - 1);
        }
        this.cargar();
      },
      error: (err) => this.error.set(errorMessage(err)),
    });
  }
}
