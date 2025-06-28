import { Component, OnInit } from '@angular/core';
import { TableComponent, TableColumn } from "../../../../shared/table/table.component";

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

  constructor() { }

  ngOnInit(): void {
    this.getAllCategoriesAndServices();
  }

  //here is the function needed to fetch all categories and services based on each category 
  getAllCategoriesAndServices(): void {
    this.categoryService = [{ id: 1, categoryName: 'Sports Rehab', services: [{ id: 1, name: 'Consultation', price: 500 }, { id: 2, name: 'Rehab Session', price: 900 }] }, { id: 2, categoryName: 'Sports Recovery', services: [{ id: 3, name: 'Full Body', price: 900 }, { id: 3, name: 'Half Body', price: 600 }] }]
  }
}
