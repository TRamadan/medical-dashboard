import { TestBed } from '@angular/core/testing';

import { AtheleteprofileService } from './atheleteprofile.service';

describe('AtheleteprofileService', () => {
  let service: AtheleteprofileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AtheleteprofileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
