import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservasStepper } from './reservas-stepper';

describe('ReservasStepper', () => {
  let component: ReservasStepper;
  let fixture: ComponentFixture<ReservasStepper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservasStepper],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservasStepper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
