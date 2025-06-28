import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../shared/table/table.component';
import { FloatLabelModule } from 'primeng/floatlabel';

interface AboutUs {
  textEn: string;
  textAr: string;
  descriptionEn: string;
  descriptionAr: string;
  type: string;
  status?: string;
}

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    TableModule,
    InputTextModule,
    ToolbarModule,
    TableComponent,
    FloatLabelModule
  ]
})
export class AboutUsComponent implements OnInit {
  showAddDialog: boolean = false;
  addAboutUsForm: FormGroup;
  selectedAboutUs: AboutUs | null = null;
  aboutUsEntries: AboutUs[] = [];
  isEdit: boolean = false;
  isDelete: boolean = false;

  tableHeaders = [
    { label: 'Text (EN)', field: 'textEn' },
    { label: 'Text (AR)', field: 'textAr' },
    { label: 'Description (EN)', field: 'descriptionEn' },
    { label: 'Description (AR)', field: 'descriptionAr' },
    { label: 'Type', field: 'type' }
  ];

  constructor(private fb: FormBuilder) {
    this.addAboutUsForm = this.fb.group({
      textEn: ['', Validators.required],
      textAr: ['', Validators.required],
      descriptionEn: ['', Validators.required],
      descriptionAr: ['', Validators.required],
      type: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.getAllAboutUsEntries();
  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Purpose : Open the dialog for adding/editing an About Us entry
   */
  openAboutUsDialog(): void {
    this.addAboutUsForm.reset();
    this.isEdit = false;
    this.isDelete = false;
    this.showAddDialog = true;
  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Purpose : Fetch all About Us entries from the backend
   */
  getAllAboutUsEntries(): void {
    //api logic goes here
    this.aboutUsEntries = [
      { textEn: 'Welcome', textAr: 'مرحبا', descriptionEn: 'Welcome to our platform', descriptionAr: 'مرحبا بكم في منصتنا', type: 'intro', status: 'active' }
    ];
  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Purpose : Add a new About Us entry
   */
  addNewAboutUs(): void {
    //api logic goes here
    const newEntry = { ...this.addAboutUsForm.value, status: 'active' };
    this.aboutUsEntries.push(newEntry);
    this.addAboutUsForm.reset();
    this.showAddDialog = false;
  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Purpose : Update the selected About Us entry
   */
  updateSelectedAboutUs(): void {
    //api logic goes here
  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Purpose : Delete the selected About Us entry
   */
  deleteSelectedAboutUs(): void {
    //api logic goes here

  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Purpose : Open dialog and set data for the selected About Us entry in the form
   * @param entry The About Us entry to edit
   */
  editAboutUs(entry: AboutUs): void {
    this.selectedAboutUs = { ...entry };
    this.addAboutUsForm.patchValue(this.selectedAboutUs);
    this.isEdit = true;
    this.showAddDialog = true;
  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Purpose : Open dialog to confirm About Us entry deletion
   * @param entry The About Us entry to delete
   */
  deleteAboutUs(entry: AboutUs): void {
    this.selectedAboutUs = entry;
    this.isDelete = true;
    this.showAddDialog = true;
  }
}
