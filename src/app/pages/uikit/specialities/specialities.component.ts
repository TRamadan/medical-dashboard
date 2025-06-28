import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TableComponent, TableColumn } from '../../../shared/table/table.component';
import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-specialities',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableComponent,
    ToolbarModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputTextModule,
    FloatLabelModule
  ],
  templateUrl: './specialities.component.html',
  styleUrl: './specialities.component.scss'
})
export class SpecialitiesComponent {
  // Dialog and state flags
  isDialogOpen = false;
  isEdit = false;
  isDelete = false;

  // Form for add/edit
  specialityForm: FormGroup;

  // Table data and columns
  headers: TableColumn[] = [
    { label: 'Speciality Name (Arabic)', field: 'nameAr', type: 'text', sortable: true },
    { label: 'Speciality Name (English)', field: 'nameEn', type: 'text', sortable: true }
  ];
  data: { id?: number; nameAr: string; nameEn: string }[] = [];
  selectedSpeciality: any = null;

  constructor(private fb: FormBuilder) {
    this.specialityForm = this.fb.group({
      nameAr: [null, Validators.required],
      nameEn: [null, Validators.required]
    });
  }

  /**
   * Fetch all specialities from the API and update the table data.
   * Developer: Eng/Tarek Ahmed Ramadan
   * Created Date: 2025-06-01
   */
  getAllSpecialities(): void {
    // TODO: Replace with real API call
    this.data = [
      { id: 1, nameAr: 'عظام', nameEn: 'Orthopedics' },
      { id: 2, nameAr: 'قلب', nameEn: 'Cardiology' }
    ];
  }

  /**
   * Add a new speciality using the API.
   * Developer: Eng/Tarek Ahmed Ramadan
   * Created Date: 2025-06-01
   */
  addNewSpeciality(): void {
    if (this.specialityForm.valid) {
      // TODO: Replace with real API call
      const newSpeciality = { ...this.specialityForm.value, id: Date.now() };
      this.data.push(newSpeciality);
      this.hideDialog();
    }
  }

  /**
   * Open the dialog for add/edit/delete actions.
   * Developer: Eng/Tarek Ahmed Ramadan
   * Created Date: 2025-06-01
   * @param mode 'add' | 'edit' | 'delete'
   * @param row The selected row for edit/delete
   */
  openDialog(mode: 'add' | 'edit' | 'delete', row?: any): void {
    this.isDialogOpen = true;
    this.isEdit = mode === 'edit';
    this.isDelete = mode === 'delete';
    if (mode === 'edit' && row) {
      this.selectedSpeciality = row;
      this.specialityForm.patchValue({
        nameAr: row.nameAr,
        nameEn: row.nameEn
      });
    } else if (mode === 'delete' && row) {
      this.selectedSpeciality = row;
    } else {
      this.selectedSpeciality = null;
      this.specialityForm.reset();
    }
  }

  /**
   * Hide the dialog and reset all flags and form.
   * Developer: Eng/Tarek Ahmed Ramadan
   * Created Date: 2025-06-01
   */
  hideDialog(): void {
    this.isDialogOpen = false;
    this.isEdit = false;
    this.isDelete = false;
    this.selectedSpeciality = null;
    this.specialityForm.reset();
  }

  /**
   * Edit the selected speciality: open dialog and set form values.
   * Developer: Eng/Tarek Ahmed Ramadan
   * Created Date: 2025-06-01
   * @param row The selected row
   */
  editSelectedSpeciality(row: any): void {
    this.openDialog('edit', row);
  }

  /**
   * Delete the selected speciality: open dialog and set delete flag.
   * Developer: Eng/Tarek Ahmed Ramadan
   * Created Date: 2025-06-01
   * @param row The selected row
   */
  deleteSelectedSpeciality(row: any): void {
    this.openDialog('delete', row);
  }

  /**
   * Update the selected speciality using the API.
   * Developer: Eng/Tarek Ahmed Ramadan
   * Created Date: 2025-06-01
   */
  updateSelectedSpeciality(): void {
    if (this.specialityForm.valid && this.selectedSpeciality) {
      // TODO: Replace with real API call
      const idx = this.data.findIndex(s => s.id === this.selectedSpeciality.id);
      if (idx > -1) {
        this.data[idx] = { ...this.selectedSpeciality, ...this.specialityForm.value };
      }
      this.hideDialog();
    }
  }

  /**
   * Confirm (delete) the selected speciality using the API.
   * Developer: Eng/Tarek Ahmed Ramadan
   * Created Date: 2025-06-01
   */
  confirmSelectedSpeciality(): void {
    if (this.selectedSpeciality) {
      // TODO: Replace with real API call
      this.data = this.data.filter(s => s.id !== this.selectedSpeciality.id);
      this.hideDialog();
    }
  }

  ngOnInit() {
    this.getAllSpecialities();
  }
}
