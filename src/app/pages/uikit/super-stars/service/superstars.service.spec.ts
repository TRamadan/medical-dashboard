import { TestBed } from '@angular/core/testing';

import { SuperstarsService } from '../service/superstars.service';

describe('SuperstarsService', () => {
  let service: SuperstarsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuperstarsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
