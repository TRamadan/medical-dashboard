import { Component, OnInit } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { TableComponent, TableColumn } from '../../../table/table.component';
import { DialogModule } from 'primeng/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Certifications } from "./models/certifications";
import { InputTextModule } from 'primeng/inputtext';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule,
    CommonModule,
    InputTextModule,
    DialogModule, TableComponent, ToolbarModule, ButtonModule],
  selector: 'app-certifications',
  templateUrl: './certifications.component.html',
  styleUrls: ['./certifications.component.css']
})
export class CertificationsComponent implements OnInit {
  showAddDialog: boolean = false;
  addCertificateForm!: FormGroup;
  selectedCertificate: Certifications | null = null;
  allCertificates: Certifications[] = [];
  isEdit: boolean = false;
  isDelete: boolean = false;
  constructor(private fb: FormBuilder) {
    this.addCertificateForm = this.fb.group({
      nameAr: ['', Validators.required],
      nameEn: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  tableHeaders: TableColumn[] = [
    { label: 'Certificate Name (AR)', field: 'nameAr' },
    { label: 'Certificate Name (EN)', field: 'nameEn' },
  ];

  /**
   * Developer : Eng/Tarek Ahmed Ramadan 
   * Created at : 1/6/2025
   * Purpose : this function is responsible for open a dialog that add a new certificate 
   */
  openCertificationsDialog(): void {
    this.showAddDialog = true;
    this.isEdit = false;
    this.isDelete = false;
  }

  /**
 * Developer : Eng/Tarek Ahmed Ramadan
 * Created Date : 10/6/2025
 * Purpose : Fetch all certificates entries from the backend
 */
  getAllCertifications(): void {
    //api logic goes here
    this.allCertificates = [
      { id: 1, nameAr: 'شهادة 1', nameEn: 'certificate 1' }
    ];
  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Purpose :Use an endpoint to add a new certificate entry
   */
  addNewCertificate(): void {
    //api logic goes here
    const newEntry = { ...this.addCertificateForm.value, status: 'active' };
    this.allCertificates.push(newEntry);
    this.addCertificateForm.reset();
    this.showAddDialog = false;
  }

  /**
 * Developer : Eng/Tarek Ahmed Ramadan
 * Created Date : 10/6/2025
 * Purpose : Update the selected certificate entry
 */
  updateSelectedCertificate(): void {
    //api logic goes here
  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Purpose : Delete the selected certificate entry
   */
  deleteSelectedCertificate(): void {
    //api logic goes here
  }

  /**
  * Developer : Eng/Tarek Ahmed Ramadan
  * Created Date : 10/6/2025
  * Purpose : Open dialog and set data for the selected certificate entry in the form
  * @param entry The certificate entry to edit
  */
  editSelectedCertificate(entry: Certifications): void {
    this.selectedCertificate = { ...entry };
    this.addCertificateForm.patchValue(this.selectedCertificate);
    this.isEdit = true;
    this.showAddDialog = true;
  }

  /**
  * Developer : Eng/Tarek Ahmed Ramadan
  * Created Date : 10/6/2025
  * Purpose : Open dialog and set data for the selected certificate entry in the form
  * @param entry The certificate entry to edit
  */
  deleteCertificate(entry: Certifications): void {
    this.isDelete = true;
    this.showAddDialog = true;
  }

}
