import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MesaAdmin } from './mesa-admin';

describe('MesaAdmin', () => {
  let component: MesaAdmin;
  let fixture: ComponentFixture<MesaAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesaAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(MesaAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
