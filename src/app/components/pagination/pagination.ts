import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pagination.css',
  templateUrl: './pagination.html',
})
export class Pagination {
   readonly page = input.required<number>();
    readonly size = input.required<number>();
    readonly totalElements = input.required<number>();
    readonly totalPages = input.required<number>();
    readonly sizeOptions = input<number[]>([5, 10, 20, 50]);
  
    readonly pageChange = output<number>();
    readonly sizeChange = output<number>();
  
    readonly from = computed(() => (this.totalElements() === 0 ? 0 : this.page() * this.size() + 1));
    readonly to = computed(() => Math.min((this.page() + 1) * this.size(), this.totalElements()));
  
    /** Ventana de hasta 5 números de página alrededor de la actual. */
    readonly pages = computed(() => {
      const total = this.totalPages();
      const windowSize = 5;
      const end = Math.min(total, Math.max(0, this.page() - 2) + windowSize);
      const start = Math.max(0, end - windowSize);
      return Array.from({ length: end - start }, (_, i) => start + i);
    });
}
