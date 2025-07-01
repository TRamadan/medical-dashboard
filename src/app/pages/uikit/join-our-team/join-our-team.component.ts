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

@Component({
  selector: 'app-join-our-team',
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
    FormsModule
  ],
  templateUrl: './join-our-team.component.html',
  styleUrls: ['./join-our-team.component.css']
})
export class JoinOurTeamComponent implements OnInit {
  teamEntries: any[] = [];
  selectedEntry: any = null;
  isEntryDialog = false;
  isDeleteDialog = false;
  isEdit = false;
  isDelete = false;
  entryForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.entryForm = this.fb.group({
      titleAr: [null, Validators.required],
      titleEn: [null, Validators.required],
      descriptionAr: [null, Validators.required],
      descriptionEn: [null, Validators.required],
      detailsAr: [null, Validators.required],
      detailsEn: [null, Validators.required]
    });
    this.getEntries();
  }

  // CRUD API methods (stubbed)
  getEntries() {
    // TODO: Call API to get all entries
    // this.teamEntries = ...
  }
  addEntry(data: any) {
    // TODO: Call API to add entry
  }
  updateEntry(id: any, data: any) {
    // TODO: Call API to update entry
  }
  deleteEntry(id: any) {
    // TODO: Call API to delete entry
  }

  // Dialog helpers
  openAddEditDialog() {
    this.isEdit = false;
    this.selectedEntry = null;
    this.entryForm.reset();
    this.isEntryDialog = true;
  }
  onEditEntry(entry: any) {
    this.isEdit = true;
    this.selectedEntry = entry;
    this.entryForm.patchValue(entry);
    this.isEntryDialog = true;
  }
  onDeleteEntry(entry: any) {
    this.selectedEntry = entry;
    this.isDeleteDialog = true;
  }
  closeDialog() {
    this.isEntryDialog = false;
    this.entryForm.reset();
    this.isEdit = false;
    this.selectedEntry = null;
  }
  closeDeleteDialog() {
    this.isDeleteDialog = false;
    this.selectedEntry = null;
  }
  onSaveEntry() {
    if (this.entryForm.invalid) return;
    const data = this.entryForm.value;
    if (this.isEdit && this.selectedEntry) {
      this.updateEntry(this.selectedEntry['id'], data);
    } else {
      this.addEntry(data);
    }
    this.closeDialog();
  }
  onConfirmDelete() {
    if (this.selectedEntry) {
      this.deleteEntry(this.selectedEntry['id']);
    }
    this.closeDeleteDialog();
  }

  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
