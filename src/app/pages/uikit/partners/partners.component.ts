import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { TableComponent, TableColumn } from '../../../table/table.component';
import { Partners } from './models/partners';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    TableModule,
    InputTextModule,
    ToolbarModule,
    FileUploadModule,
    TableComponent
  ]
})
export class PartnersComponent implements OnInit {
  showAddDialog: boolean = false;
  addPartnerForm: FormGroup;
  selectedPartner: any = null;
  partners: Partners[] = [];
  isEdit: boolean = false;
  isDelete: boolean = false;

  tableHeaders: TableColumn[] = [
    { label: 'Partner Image', field: 'imageUrl', type: 'image' }
  ];

  constructor(private fb: FormBuilder) {
    this.addPartnerForm = this.fb.group({
      image: [null],
      imageUrl: ['']
    });
  }

  ngOnInit() {
    this.getAllPartners();
  }



  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Purpose : Open the dialog for adding/editing a partner
   */
  openServiceDialog(): void {
    this.addPartnerForm.reset();
    this.isEdit = false;
    this.isDelete = false;
    this.showAddDialog = true;
  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Purpose : Fetch all partners from the backend
   */
  getAllPartners(): void {
    //api logic goes here
    this.partners = [
      { img: 'assets/placeholder-image.png', status: 'active' }
    ];
  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Purpose : Add a new partner to the system
   */
  addNewPartner(): void {
    //api logic goes here
    const newPartner = { ...this.addPartnerForm.value, status: 'active' };
    this.partners.push(newPartner);
    this.addPartnerForm.reset();
    this.showAddDialog = false;
  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Purpose : Update the selected partner's information
   */
  updateSelectedPartner(): void {
    //api logic goes here
  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Purpose : Delete the selected partner from the system
   */
  deleteSelectedPartner(): void {
    //api logic goes here
  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Purpose : Open dialog and set data for the selected partner in the form
   * @param partner The partner object to edit
   */
  editPartner(partner: any): void {
    this.selectedPartner = { ...partner };
    this.addPartnerForm.patchValue(this.selectedPartner);
    this.isEdit = true;
    this.showAddDialog = true;
  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Purpose : Open dialog to confirm partner deletion
   * @param partner The partner object to delete
   */
  deletePartner(partner: any): void {
    this.selectedPartner = partner;
    this.isDelete = true;
    this.showAddDialog = true;
  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Purpose : Handle image upload and preview
   * @param event The file upload event
   */
  onImageUpload(event: any): void {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.addPartnerForm.patchValue({
          imageUrl: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  }
}
