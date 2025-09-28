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
import { FloatLabelModule } from 'primeng/floatlabel';
import { TableComponent, TableColumn, TableAction } from '../../../shared/table/table.component';
import { Permission } from './models/permission';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastModule } from 'primeng/toast';
import { RolesService } from './services/roles.service';
import { DropdownModule } from 'primeng/dropdown';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
    selector: 'app-add-permission',
    standalone: true,
    imports: [FloatLabelModule, CommonModule, ReactiveFormsModule, TableComponent, ButtonModule, DialogModule, InputTextModule, ConfirmDialogModule, ToolbarModule, ToastModule, CardModule, DropdownModule, ToggleSwitchModule],
    templateUrl: './add-permission.component.html',
    styleUrls: ['./add-permission.component.css'],
    providers: [ConfirmationService, MessageService]
})
export class AddPermissionComponent implements OnInit {
    private readonly formBuilder = inject(FormBuilder);
    private readonly rolesService = inject(RolesService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly messageService = inject(MessageService);
    private readonly destroyRef = inject(DestroyRef);

    isEdit = false;
    displayDialog = false;

    allPermissions: Permission[] = [];
    addPermissionForm!: FormGroup;
    parentPermissions: Permission[] = [];

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
            { field: 'name', label: 'Name (EN)' },
            { field: 'nameAr', label: 'Name (AR)' },
            { field: 'pageUrl', label: 'Page URL' },
            { field: 'isPage', label: 'Is Page', type: 'boolean' }
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
        this.addPermissionForm = this.formBuilder.group(
            {
                id: [''],
                name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
                nameAr: ['', [Validators.required, Validators.pattern(/^[\u0600-\u06FF\s]*$/)]],
                pageUrl: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)]],
                isPage: [false],
                parentId: [null]
            },
            { updateOn: 'change' }
        );
    }

    /**
     * Fetches all permissions from the API.
     */
    getAllPermissions() {
        this.rolesService
            .getAllRoles()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (permissions: Permission[]) => {
                    this.allPermissions = permissions;
                    this.parentPermissions = permissions.filter((p) => p.isPage);
                },
                error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch roles.' })
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
     * @param role The permission to edit.
     */
    editPermission(role: Permission) {
        this.isEdit = true;
        this.addPermissionForm.patchValue(role);
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
        this.rolesService
            .addRole(this.addPermissionForm.value)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role added successfully.' });
                    this.getAllPermissions();
                    this.displayDialog = false;
                },
                error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add role.' })
            });
    }

    /**
     * Updates the selected permission using an API call.
     */
    private updatePermission() {
        this.rolesService
            .updateRole(this.addPermissionForm.value)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role updated successfully.' });
                    this.getAllPermissions();
                    this.displayDialog = false;
                },
                error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update role.' })
            });
    }

    /**
     * Shows a confirmation dialog before deleting a permission.
     * @param role The permission to delete.
     */
    onDeletePermission(role: Permission) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete the role "${role.name}"?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.confirmDelete(role.id),
            reject: () => {}
        });
    }

    /**
     * Deletes the selected permission using an API call.
     * @param permissionId The ID of the permission to delete.
     */
    private confirmDelete(permissionId: string) {
        this.rolesService
            .deleteRole(permissionId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role deleted successfully.' });
                    this.getAllPermissions();
                },
                error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete role.' })
            });
    }
}
