import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { MessagesModule } from 'primeng/messages';
import { Subscription } from 'rxjs';
import { ServiceslocationService } from './services/serviceslocation.service';
import { CategorySearchPipe } from './category-search.pipe';

@Component({
    selector: 'app-location-service-form',
    standalone: true,
    imports: [FormsModule, CardModule, MessagesModule, CategorySearchPipe],
    templateUrl: './location-service-form.component.html',
    styleUrls: ['./location-service-form.component.css']
})
export class LocationServiceFormComponent implements OnInit {
    searchTerm: string = '';
    servicesSearchTerm: string = '';
    previousServiceId: number | null = null;
    @Output() choosedServiceAndLocation = new EventEmitter<any>();

    locations: any[] = [];
    categories: any[] = [];
    bookingData: any = {};

    constructor(private _serviceCategory: ServiceslocationService) {}

    ngOnInit() {
        this.getAllCategories();
    }

    getAllCategories(): void {
        this._serviceCategory.getServiceCategories().subscribe({
            next: (res: any) => {
                debugger
                this.categories = res.data;
            },
            error: (error: any) => {
                console.error('Error fetching categories', error);
            }
        });
    }

    trackById(index: number, item: any): number {
        return item.id;
    }

    handleServiceSelection(category: any, service: any): void {
        debugger;
        const prevServiceId = this.bookingData.serviceId ?? null;
        this.bookingData.serviceCategoryId = category.id;
        this.bookingData.serviceCategoryName = category.nameEn;

        this.bookingData.serviceId = service.id;
        this.bookingData.serviceName = service.nameEn;

        this.locations = service.locations || [];

        if (prevServiceId !== service.id) {
            this.bookingData.locationId = null;
            this.bookingData.locationName = null;
        }

        service.subServices.length > 0 ? (this.bookingData.isContainSubservices = true) : (this.bookingData.isContainSubservices = false);

        this.previousServiceId = service.id;
    }

    handleLocationSelect(location: any): void {
        this.bookingData.locationId = location.id;
        this.bookingData.locationName = location.nameEn;

        this.choosedServiceAndLocation.emit(this.bookingData);
    }

    isSelectedService(service: any): boolean {
        return this.bookingData.serviceId === service.id;
    }

    isSelectedLocation(location: any): boolean {
        return this.bookingData.locationId === location.id;
    }
}
