import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pagination } from '../../../components/pagination/pagination';
import { PageResponse, errorMessage } from '../../../shared/utils';
import { MesaResponse, MesaService } from '../../services/mesa-service';

@Component({
  imports: [ReactiveFormsModule, Pagination],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-mesa-admin',
  styleUrl: './mesa-admin.css',
  templateUrl: './mesa-admin.html',
})
export class MesaAdmin implements OnInit {
  private readonly service = inject(MesaService);
  private readonly fb = inject(FormBuilder).nonNullable;
 
  readonly data = signal<PageResponse<MesaResponse> | null>(null);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly formOpen = signal(false);
  readonly editingId = signal<number | null>(null);
 
  readonly filtros = this.fb.group({
    capacidadMin: [null as number | null],
    activa: [''],
  });
 
  readonly form = this.fb.group({
    numero: [null as number | null, [Validators.required, Validators.min(1)]],
    capacidad: [null as number | null, [Validators.required, Validators.min(1), Validators.max(50)]],
    activa: [true],
  });
 
  ngOnInit(): void {
    this.cargar();
  }
 
  cargar(): void {
    const { capacidadMin, activa } = this.filtros.getRawValue();
    this.loading.set(true);
    this.service
      .listar(capacidadMin, activa === '' ? null : activa === 'true', this.page(), this.size())
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
 
  nueva(): void {
    this.editingId.set(null);
    this.form.reset({ numero: null, capacidad: null, activa: true });
    this.formOpen.set(true);
  }
 
  editar(m: MesaResponse): void {
    this.editingId.set(m.id);
    this.form.reset({ numero: m.numero, capacidad: m.capacidad, activa: m.activa });
    this.formOpen.set(true);
  }
 
  cancelar(): void {
    this.formOpen.set(false);
    this.editingId.set(null);
  }
 
  invalid(name: 'numero' | 'capacidad'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }
 
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const req = { numero: raw.numero!, capacidad: raw.capacidad!, activa: raw.activa };
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
 
  desactivar(m: MesaResponse): void {
    if (!confirm(`¿Desactivar la mesa ${m.numero}?`)) return;
    this.error.set(null);
    this.service.desactivar(m.id).subscribe({
      next: () => this.cargar(),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }
}
