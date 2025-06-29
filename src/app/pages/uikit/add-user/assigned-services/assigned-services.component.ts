import { Component, OnInit, signal } from '@angular/core';
import { TableComponent, TableColumn } from "../../../../shared/table/table.component";
import { AssignedServicesStateService } from '../services/assigned-services-state.service';

interface CategoryService {
  id: number;
  categoryName: string;
  services: Service[];
}

interface Service {
  id: number;
  name: string;
  price: number
}
@Component({
  selector: 'app-assigned-services',
  imports: [TableComponent],
  standalone: true,
  templateUrl: './assigned-services.component.html',
  styleUrl: './assigned-services.component.scss'
})
export class AssignedServicesComponent implements OnInit {
  categoryService: CategoryService[] = [];
  selectedServicesByCategory = signal<{ [categoryId: number]: Service[] }>({});

  constructor(private assignedServicesState: AssignedServicesStateService) {
    console.log('AssignedServicesComponent instance created');
  }

  ngOnInit(): void {
    console.log('AssignedServicesComponent ngOnInit');
    this.getAllCategoriesAndServices();
    // Initialize selection arrays for each category
    const initialSelections: { [categoryId: number]: Service[] } = {};
    for (const cat of this.categoryService) {
      initialSelections[cat.id] = [];
    }
    this.selectedServicesByCategory.set(initialSelections);
  }

  getAllCategoriesAndServices(): void {
    this.categoryService = [
      { id: 1, categoryName: 'Sports Rehab', services: [{ id: 1, name: 'Consultation', price: 500 }, { id: 2, name: 'Rehab Session', price: 900 }] },
      { id: 2, categoryName: 'Sports Recovery', services: [{ id: 3, name: 'Full Body', price: 900 }, { id: 4, name: 'Half Body', price: 600 }] }
    ];
  }

  setSelectedServices(categoryId: number, event: any) {
    const services = event || [];
    const current = this.selectedServicesByCategory();
    this.selectedServicesByCategory.set({
      ...current,
      [categoryId]: [...services]
    });
    // Gather all selected services from all categories
    const allSelected = Object.values(this.selectedServicesByCategory()).flat();
    this.assignedServicesState.setSelectedServices(allSelected);
  }
}
