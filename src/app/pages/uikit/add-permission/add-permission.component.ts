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
import { Roles } from './models/permission';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastModule } from 'primeng/toast';
import { RolesService } from './services/roles.service';
import { DropdownModule } from 'primeng/dropdown';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
@Component({
    selector: 'app-add-permission',
    standalone: true,
    imports: [
        TableModule,
        SelectModule,
        FloatLabelModule,
        CommonModule,
        ReactiveFormsModule,
        TableComponent,
        ButtonModule,
        DialogModule,
        InputTextModule,
        ConfirmDialogModule,
        ToolbarModule,
        ToastModule,
        CardModule,
        DropdownModule,
        ToggleSwitchModule
    ],
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

    isEdit: boolean = false;
    displayDialog: boolean = false;
    isDelete: boolean = false;

    allPermissions: Roles[] = [];
    rolesArr: Roles[] = [];
    addPermissionForm!: FormGroup;
    parentPermissions: Roles[] = [];

    tableColumns: TableColumn[] = [];
    tableActions: TableAction[] = [];

    tableColumnsRoles: TableColumn[] = [];
    tableActionsRoles: TableAction[] = [];

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
            { label: 'Edit', icon: 'pi pi-pencil', type: 'primary', onClick: (row: Roles) => this.editPermission(row) },
            { label: 'Delete', icon: 'pi pi-trash', type: 'danger', onClick: (row: Roles) => this.onDeletePermission(row) }
        ];

        this.tableColumnsRoles = [
            { field: 'name', label: 'Name (EN)' },
            { field: 'nameAr', label: 'Name (AR)' },
            { field: 'pageUrl', label: 'Page URL' },
            { field: 'isPage', label: 'Is Page', type: 'boolean' }
        ];

        this.tableActionsRoles = [{ label: 'Delete', icon: 'pi pi-trash', type: 'danger', onClick: (row: Roles) => this.deleteRoleBeforeSave(row) }];
    }

    /**
     * here is the function needed to delete the selected role before save
     *
     */
    deleteRoleBeforeSave(role: Roles): void {
        this.rolesArr.splice(this.rolesArr.indexOf(role), 1);
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
                pageUrl: [''],
                isPage: [false],
                parentId: [null]
            },
            { updateOn: 'change' }
        );

        this.addPermissionForm.get('isPage')?.valueChanges.subscribe((isPageValue: boolean) => {
            const pageUrlControl = this.addPermissionForm.get('pageUrl');

            if (isPageValue) {
                pageUrlControl?.setValidators([Validators.required, Validators.pattern(/^\/[a-zA-Z0-9\/_-]*$/)]);
            } else {
                pageUrlControl?.clearValidators();
            }

            pageUrlControl?.updateValueAndValidity();
        });
    }

    /**
     * Fetches all permissions from the API.
     */
    getAllPermissions() {
        this.rolesService.getAllRoles().subscribe({
            next: (permissions: any) => {
                this.allPermissions = permissions.data as Roles[];
                this.parentPermissions = permissions.data.map((element: any) => {
                    return {
                        id: element.id,
                        name: element.name
                    };
                });
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
     * here is the function needed to close the dialog
     */
    hideDialog(): void {
        this.addPermissionForm.reset();
        this.displayDialog = false;
        this.isEdit = false;
        this.isDelete = false;
    }

    //here is the function needed to push more than one role in one time per request
    pushMoreThanOneRole(): void {
        this.rolesArr.push({
            name: this.addPermissionForm.controls['name'].value,
            nameAr: this.addPermissionForm.controls['nameAr'].value,
            pageUrl: this.addPermissionForm.controls['pageUrl'].value,
            isPage: this.addPermissionForm.controls['isPage'].value == null ? false : true,
            parentId: this.addPermissionForm.controls['parentId'].value
        });
    }

    /**
     * Opens the dialog in edit mode and sets the form values for the chosen row.
     * @param role The permission to edit.
     */
    editPermission(role: Roles) {
        this.isEdit = true;
        this.addPermissionForm.patchValue(role);
        this.displayDialog = true;
    }

    /**
     * Saves the permission. It either adds a new permission or updates an existing one.
     */
    savePermission() {
        if (this.isEdit) {
            this.updatePermission();
        } else if (this.isDelete) {
            //delete record function will go here
        } else {
            this.addPermission();
        }
    }

    /**
     * Adds a new permission using an API call.
     */
    addPermission() {
        this.rolesService.addRole(this.rolesArr).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role added successfully.' });
                this.getAllPermissions();
                this.hideDialog();
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
    onDeletePermission(role: Roles) {}

    /**
     * Deletes the selected permission using an API call.
     * @param permissionId The ID of the permission to delete.
     */
    private confirmDelete(permissionId: string) {
        this.rolesService.deleteRole(permissionId).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role deleted successfully.' });
                this.getAllPermissions();
            },
            error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete role.' })
        });
    }
}
