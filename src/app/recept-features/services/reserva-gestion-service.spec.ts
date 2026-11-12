import { TestBed } from '@angular/core/testing';
import { ReservaGestionService } from './reserva-gestion-service';

describe('ReservaGestionService', () => {
  let service: ReservaGestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReservaGestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
