import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { CommonModule } from '@angular/common';
import { DynamicReportComponent } from "../dynamic-report.component";

@Component({
  selector: 'app-our-services',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    ToolbarModule,
    CardModule,
    FloatLabelModule,
    InputIconModule,
    IconFieldModule,
    ReactiveFormsModule,
    FormsModule,
    DynamicReportComponent
  ],
  templateUrl: './our-services.component.html',
  styleUrls: ['./our-services.component.css']
})
export class OurServicesComponent implements OnInit {
  services: any[] = [];
  selectedService: any = null;
  isServiceDialog = false;
  isDeleteDialog = false;
  isEdit = false;
  serviceForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.serviceForm = this.fb.group({
      titleAr: [null, Validators.required],
      titleEn: [null, Validators.required],
      descriptionAr: [null, Validators.required],
      descriptionEn: [null, Validators.required]
    });
    this.getServices();
  }

  // CRUD API methods (stubbed)
  getServices() {
    // TODO: Call API to get all services
    // this.services = ...
  }
  addService(data: any) {
    // TODO: Call API to add service
  }
  updateService(id: any, data: any) {
    // TODO: Call API to update service
  }
  deleteService(id: any) {
    // TODO: Call API to delete service
  }

  // Dialog helpers
  openAddEditDialog() {
    this.isEdit = false;
    this.selectedService = null;
    this.serviceForm.reset();
    this.isServiceDialog = true;
  }
  onEditService(service: any) {
    this.isEdit = true;
    this.selectedService = service;
    this.serviceForm.patchValue(service);
    this.isServiceDialog = true;
  }
  onDeleteService(service: any) {
    this.selectedService = service;
    this.isDeleteDialog = true;
  }
  closeDialog() {
    this.isServiceDialog = false;
    this.serviceForm.reset();
    this.isEdit = false;
    this.selectedService = null;
  }
  closeDeleteDialog() {
    this.isDeleteDialog = false;
    this.selectedService = null;
  }
  onSaveService() {
    if (this.serviceForm.invalid) return;
    const data = this.serviceForm.value;
    if (this.isEdit && this.selectedService) {
      this.updateService(this.selectedService['id'], data);
    } else {
      this.addService(data);
    }
    this.closeDialog();
  }
  onConfirmDelete() {
    if (this.selectedService) {
      this.deleteService(this.selectedService['id']);
    }
    this.closeDeleteDialog();
  }

  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
