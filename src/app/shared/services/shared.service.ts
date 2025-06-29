import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  selectedServices = signal<any[]>([]);

  setSelectedServices(services: any[]) {
    this.selectedServices.set(services);
  }

  getSelectedServices() {
    return this.selectedServices();
  }
  constructor() { }
}
