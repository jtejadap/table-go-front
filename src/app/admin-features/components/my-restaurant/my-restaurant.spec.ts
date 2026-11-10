import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyRestaurant } from './my-restaurant';

describe('MyRestaurant', () => {
  let component: MyRestaurant;
  let fixture: ComponentFixture<MyRestaurant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyRestaurant],
    }).compileComponents();

    fixture = TestBed.createComponent(MyRestaurant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
