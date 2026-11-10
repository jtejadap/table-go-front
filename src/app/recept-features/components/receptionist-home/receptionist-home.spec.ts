import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReceptionistHome } from './receptionist-home';

describe('ReceptionistHome', () => {
  let component: ReceptionistHome;
  let fixture: ComponentFixture<ReceptionistHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceptionistHome],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceptionistHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
