import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { EstadoReserva, PASOS } from '../../models/reserva-models';
 
type EstadoPaso = 'hecho' | 'actual' | 'siguiente' | 'pendiente' | 'apagado';

@Component({
  imports: [],
  selector: 'app-reservas-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './reservas-stepper.css',
  templateUrl: './reservas-stepper.html',
})
export class ReservasStepper {
  readonly estado = input.required<EstadoReserva>();
  protected readonly pasos = PASOS;
 
  private readonly indice = computed(() => PASOS.findIndex((p) => p.estado === this.estado()));
 
  /** Cantidad de pasos ya completados (para pintar conectores). */
  protected readonly hechoHasta = computed(() => {
    const e = this.estado();
    if (e === 'NO_SHOW') return 1; // llegó a CONFIRMADA
    if (e === 'CANCELADA') return 0;
    return this.indice();
  });
 
  protected estadoDe(i: number): EstadoPaso {
    const e = this.estado();
    if (e === 'CANCELADA' || e === 'NO_SHOW') return i < this.hechoHasta() ? 'hecho' : 'apagado';
    const actual = this.indice();
    if (e === 'COMPLETADA') return 'hecho';
    if (i < actual) return 'hecho';
    if (i === actual) return 'actual';
    if (i === actual + 1) return 'siguiente';
    return 'pendiente';
  }
 
  protected circulo(st: EstadoPaso): string {
    switch (st) {
      case 'hecho':
        return 'border-stone-500 bg-stone-500 text-white';
      case 'actual':
        return 'border-stone-800 bg-white text-stone-900 ring-4 ring-stone-200';
      case 'siguiente':
        return 'border-dashed border-stone-400 bg-white text-stone-600';
      default:
        return 'border-stone-200 bg-white text-stone-300';
    }
  }
}
