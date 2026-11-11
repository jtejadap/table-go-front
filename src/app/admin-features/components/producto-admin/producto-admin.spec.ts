import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductoAdmin } from './producto-admin';

describe('ProductoAdmin', () => {
  let component: ProductoAdmin;
  let fixture: ComponentFixture<ProductoAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
