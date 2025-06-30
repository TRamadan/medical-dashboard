import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';

import { TableComponent, TableColumn, TableAction } from '../../../shared/table/table.component';
import { Permission } from './models/permission';
import { ApiService } from '../../service/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-add-permission',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableComponent,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ConfirmDialogModule,
    ToolbarModule,
    ToastModule,
    CardModule
  ],
  templateUrl: './add-permission.component.html',
  styleUrls: ['./add-permission.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class AddPermissionComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  isEdit = false;
  displayDialog = false;

  allPermissions: Permission[] = [];
  addPermissionForm!: FormGroup;

  tableColumns: TableColumn[] = [];
  tableActions: TableAction[] = [];

  ngOnInit() {
    this.initializeForm();
    this.getAllPermissions();
    this.initializeTableConfig();
  }

  /**
   * Initializes the configuration for the table columns and actions.
   */
  private initializeTableConfig(): void {
    this.tableColumns = [
      { field: 'name', label: 'Permission Name' },
      { field: 'url', label: 'URL' }
    ];

    this.tableActions = [
      { label: 'Edit', icon: 'pi pi-pencil', type: 'primary', onClick: (row: Permission) => this.editPermission(row) },
      { label: 'Delete', icon: 'pi pi-trash', type: 'danger', onClick: (row: Permission) => this.onDeletePermission(row) }
    ];
  }

  /**
   * Initializes the add permission form.
   */
  private initializeForm(): void {
    this.addPermissionForm = this.formBuilder.group({
      id: [''],
      name: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern('^/.*')]] // Ensure URL starts with /
    });
  }

  /**
   * Fetches all permissions from the API.
   */
  getAllPermissions() {
    this.apiService.get<Permission[]>('permissions').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (permissions: Permission[]) => this.allPermissions = permissions,
      error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch permissions.' })
    });
  }

  /**
   * Opens the dialog to add a new permission.
   */
  openNew() {
    this.isEdit = false;
    this.addPermissionForm.reset();
    this.displayDialog = true;
  }

  /**
   * Opens the dialog in edit mode and sets the form values for the chosen row.
   * @param permission The permission to edit.
   */
  editPermission(permission: Permission) {
    this.isEdit = true;
    this.addPermissionForm.patchValue(permission);
    this.displayDialog = true;
  }

  /**
   * Saves the permission. It either adds a new permission or updates an existing one.
   */
  savePermission() {
    if (this.addPermissionForm.invalid) {
      this.addPermissionForm.markAllAsTouched();
      return;
    }

    if (this.isEdit) {
      this.updatePermission();
    } else {
      this.addPermission();
    }
  }

  /**
   * Adds a new permission using an API call.
   */
  private addPermission() {
    this.apiService.post<Permission>('permissions', this.addPermissionForm.value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Permission added successfully.' });
        this.getAllPermissions();
        this.displayDialog = false;
      },
      error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add permission.' })
    });
  }

  /**
   * Updates the selected permission using an API call.
   */
  private updatePermission() {
    const permissionId = this.addPermissionForm.value.id;
    this.apiService.put<Permission>(`permissions/${permissionId}`, this.addPermissionForm.value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Permission updated successfully.' });
        this.getAllPermissions();
        this.displayDialog = false;
      },
      error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update permission.' })
    });
  }

  /**
   * Shows a confirmation dialog before deleting a permission.
   * @param permission The permission to delete.
   */
  onDeletePermission(permission: Permission) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the permission "${permission.name}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.confirmDelete(permission.id),
      reject: () => { }
    });
  }

  /**
   * Deletes the selected permission using an API call.
   * @param permissionId The ID of the permission to delete.
   */
  private confirmDelete(permissionId: string) {
    this.apiService.delete<any>(`permissions/${permissionId}`).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Permission deleted successfully.' });
        this.getAllPermissions();
      },
      error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete permission.' })
    });
  }
}
