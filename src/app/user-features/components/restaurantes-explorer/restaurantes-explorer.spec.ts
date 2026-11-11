import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RestaurantesExplorer } from './restaurantes-explorer';

describe('RestaurantesExplorer', () => {
  let component: RestaurantesExplorer;
  let fixture: ComponentFixture<RestaurantesExplorer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantesExplorer],
    }).compileComponents();

    fixture = TestBed.createComponent(RestaurantesExplorer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
