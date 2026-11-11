import { TestBed } from '@angular/core/testing';
import { TablegoApiService } from './tablego-api-service';

describe('TablegoApiService', () => {
  let service: TablegoApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TablegoApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
