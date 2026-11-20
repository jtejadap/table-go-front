import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { errorMessage } from '../../../shared/utils';
import {
  GrupoRequest,
  OptimizacionRequest,
  OptimizacionResponse,
  OptimizacionService,
} from '../../services/optimizacion-service';

/** Valores iniciales: los del modelo de Investigación de Operaciones de la primera entrega. */
const VALORES_INICIALES: OptimizacionRequest = {
  aforo: 40,
  horasFuncionamiento: 10,
  eficiencia: 0.75,
  mesasDeSeis: 2,
  costoVariable: 0.38,
  costosFijos: 1500000,
  proteinaDisponibleKg: 70,
  consumoProteinaKg: 0.3,
  reservasConfirmadasDeSeis: 4,
  grupo2: { ticketPorPersona: 45000, duracionHoras: 1.25, demandaMaxima: 40 },
  grupo4: { ticketPorPersona: 40000, duracionHoras: 1.5, demandaMaxima: 30 },
  grupo6: { ticketPorPersona: 36000, duracionHoras: 2, demandaMaxima: 12 },
};

interface CampoGeneral {
  name: string;
  label: string;
  ayuda: string;
  step: string;
}

@Component({
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-optimizacion-admin',
  templateUrl: './optimizacion-admin.html',
})
export class OptimizacionAdmin {
  private readonly service = inject(OptimizacionService);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly resultado = signal<OptimizacionResponse | null>(null);
  readonly calculando = signal(false);
  readonly error = signal<string | null>(null);

  readonly camposGenerales: CampoGeneral[] = [
    { name: 'aforo', label: 'Aforo (puestos)', ayuda: 'Suma de la capacidad de todas las mesas.', step: '1' },
    { name: 'horasFuncionamiento', label: 'Horas de funcionamiento al día', ayuda: 'Ej.: de 12:00 m. a 10:00 p. m. son 10 horas.', step: '0.5' },
    { name: 'eficiencia', label: 'Eficiencia de ocupación (0 a 1)', ayuda: 'Parte de las horas que realmente se vende. 0,75 = 75 %.', step: '0.01' },
    { name: 'mesasDeSeis', label: 'Mesas de 6 puestos', ayuda: 'Cuántas mesas grandes tiene el restaurante.', step: '1' },
    { name: 'costoVariable', label: 'Costo variable (0 a 1)', ayuda: 'Parte del ticket que cuesta atender. 0,38 = 38 %.', step: '0.01' },
    { name: 'costosFijos', label: 'Costos fijos del día ($)', ayuda: 'Nómina, arriendo y servicios que se pagan siempre.', step: '1000' },
    { name: 'proteinaDisponibleKg', label: 'Proteína disponible (kg)', ayuda: 'Existencias del insumo limitante en el día.', step: '1' },
    { name: 'consumoProteinaKg', label: 'Proteína por persona (kg)', ayuda: 'Cuánta proteína consume cada comensal.', step: '0.01' },
    { name: 'reservasConfirmadasDeSeis', label: 'Reservas de 6 ya confirmadas', ayuda: 'Compromisos que no se pueden rechazar.', step: '1' },
  ];

  readonly grupos = [
    { key: 'grupo2', label: '2 personas' },
    { key: 'grupo4', label: '4 personas' },
    { key: 'grupo6', label: '6 personas' },
  ];

  readonly form = this.fb.group({
    aforo: [VALORES_INICIALES.aforo, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
    horasFuncionamiento: [VALORES_INICIALES.horasFuncionamiento, [Validators.required, Validators.min(0.5)]],
    eficiencia: [VALORES_INICIALES.eficiencia, [Validators.required, Validators.min(0.01), Validators.max(1)]],
    mesasDeSeis: [VALORES_INICIALES.mesasDeSeis, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    costoVariable: [VALORES_INICIALES.costoVariable, [Validators.required, Validators.min(0), Validators.max(1)]],
    costosFijos: [VALORES_INICIALES.costosFijos, [Validators.required, Validators.min(0)]],
    proteinaDisponibleKg: [VALORES_INICIALES.proteinaDisponibleKg, [Validators.required, Validators.min(0)]],
    consumoProteinaKg: [VALORES_INICIALES.consumoProteinaKg, [Validators.required, Validators.min(0.01)]],
    reservasConfirmadasDeSeis: [VALORES_INICIALES.reservasConfirmadasDeSeis, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    grupo2: this.grupoForm(VALORES_INICIALES.grupo2),
    grupo4: this.grupoForm(VALORES_INICIALES.grupo4),
    grupo6: this.grupoForm(VALORES_INICIALES.grupo6),
  });

  private grupoForm(g: GrupoRequest) {
    return this.fb.group({
      ticketPorPersona: [g.ticketPorPersona, [Validators.required, Validators.min(1)]],
      duracionHoras: [g.duracionHoras, [Validators.required, Validators.min(0.1)]],
      demandaMaxima: [g.demandaMaxima, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    });
  }

  invalid(path: string): boolean {
    const c = this.form.get(path);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  calcular(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.calculando.set(true);
    this.error.set(null);
    this.service.optimizar(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.resultado.set(res);
        this.calculando.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.calculando.set(false);
      },
    });
  }

  restablecer(): void {
    this.form.reset(VALORES_INICIALES);
    this.resultado.set(null);
    this.error.set(null);
  }

  formatoCOP(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(valor);
  }
}