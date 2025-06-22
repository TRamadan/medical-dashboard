/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EducationalvideosService } from './educationalvideos.service';

describe('Service: Educationalvideos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EducationalvideosService]
    });
  });

  it('should ...', inject([EducationalvideosService], (service: EducationalvideosService) => {
    expect(service).toBeTruthy();
  }));
});
