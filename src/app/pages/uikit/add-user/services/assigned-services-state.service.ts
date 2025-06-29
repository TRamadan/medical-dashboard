import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AssignedServicesStateService {
    selectedServices = signal<any[]>([]);

    constructor() {

    }

    setSelectedServices(services: any[]) {
        this.selectedServices.set(services);
    }

    getSelectedServices() {
        return this.selectedServices();
    }
} 