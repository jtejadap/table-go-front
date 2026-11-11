import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservaFlow } from './reserva-flow';

describe('ReservaFlow', () => {
  let component: ReservaFlow;
  let fixture: ComponentFixture<ReservaFlow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaFlow],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservaFlow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
