import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservasGestion } from './reservas-gestion';

describe('ReservasGestion', () => {
  let component: ReservasGestion;
  let fixture: ComponentFixture<ReservasGestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservasGestion],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservasGestion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
