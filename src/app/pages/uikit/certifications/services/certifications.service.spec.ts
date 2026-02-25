/* tslint:disable:no-unused-variable */

import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { CertificationsService } from './certifications.service';

describe('Service: Certifications', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [CertificationsService]
    });
  }));

  it('should ...', inject([CertificationsService], (service: CertificationsService) => {
    expect(service).toBeTruthy();
  }));
});
