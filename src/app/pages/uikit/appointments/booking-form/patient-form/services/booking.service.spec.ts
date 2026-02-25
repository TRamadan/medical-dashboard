/* tslint:disable:no-unused-variable */

import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { BookingService } from './booking.service';

describe('Service: Booking', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [BookingService]
    });
  }));

  it('should ...', inject([BookingService], (service: BookingService) => {
    expect(service).toBeTruthy();
  }));
});
