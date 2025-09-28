import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TableComponent, TableColumn, TableAction } from '../../../shared/table/table.component';
import { Group, Role } from './models/group';
import { GroupsService } from './services/groups.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-add-group',
    standalone: true,
    imports: [FloatLabelModule, CardModule, CommonModule, ReactiveFormsModule, TableComponent, ButtonModule, DialogModule, InputTextModule, MultiSelectModule, ConfirmDialogModule, ToolbarModule, ToastModule],
    templateUrl: './add-group.component.html',
    styleUrls: ['./add-group.component.css'],
    providers: [ConfirmationService, MessageService]
})
export class AddGroupComponent implements OnInit {
    private readonly formBuilder = inject(FormBuilder);
    private readonly groupsService = inject(GroupsService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly messageService = inject(MessageService);
    private readonly destroyRef = inject(DestroyRef);

    isEdit = false;
    displayDialog = false;

    allGroups: Group[] = [];
    allRoles: Role[] = [];
    addGroupForm!: FormGroup;

    tableColumns: TableColumn[] = [];
    tableActions: TableAction[] = [];

    ngOnInit() {
        this.initializeForm();
        this.getAllGroups();
        this.initializeTableConfig();
    }

    /**
     * Initializes the configuration for the table columns and actions.
     */
    private initializeTableConfig(): void {
        this.tableColumns = [
            { field: 'name', label: 'Group Name (EN)' },
            {
                field: 'nameAr',
                label: 'Groupe Name(Ar)'
            }
        ];

        this.tableActions = [
            { label: 'Edit', icon: 'pi pi-pencil', type: 'primary', onClick: (row: Group) => this.editGroup(row) },
            { label: 'Delete', icon: 'pi pi-trash', type: 'danger', onClick: (row: Group) => this.onDeleteGroup(row) }
        ];
    }

    /**
     * Initializes the add group form.
     */
    private initializeForm(): void {
        this.addGroupForm = this.formBuilder.group({
            id: [''],
            nameEn: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
            nameAr: ['', [Validators.required, Validators.pattern(/^[\u0600-\u06FF\s]*$/)]]
        });
    }

    /**
     * Fetches all groups from the API.
     */
    getAllGroups() {
        this.groupsService
            .getAllGroups()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (groups: Group[]) => (this.allGroups = groups),
                error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch groups.' })
            });
    }

    /**
     * Opens the dialog to add a new group.
     */
    openNew() {
        this.isEdit = false;
        this.addGroupForm.reset();
        this.displayDialog = true;
    }

    /**
     * Opens the dialog in edit mode and sets the form values for the chosen row.
     * @param group The group to edit.
     */
    editGroup(group: Group) {
        this.isEdit = true;
        this.addGroupForm.patchValue(group);
        this.displayDialog = true;
    }

    /**
     * Saves the group. It either adds a new group or updates an existing one.
     */
    saveGroup() {
        if (this.addGroupForm.invalid) {
            this.addGroupForm.markAllAsTouched();
            return;
        }

        if (this.isEdit) {
            this.updateGroup();
        } else {
            this.addGroup();
        }
    }

    /**
     * push more item in a table
     */

    pushMultipleGroup(): void {}

    /**
     * Adds a new group using an API call.
     */
    private addGroup() {
        this.groupsService
            .addGroup(this.addGroupForm.value)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Group added successfully.' });
                    this.getAllGroups();
                    this.displayDialog = false;
                },
                error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add group.' })
            });
    }

    /**
     * Updates the selected group using an API call.
     */
    private updateGroup() {
        const groupId = this.addGroupForm.value.id;
        this.groupsService
            .updateGroup(this.addGroupForm.value)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Group updated successfully.' });
                    this.getAllGroups();
                    this.displayDialog = false;
                },
                error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update group.' })
            });
    }

    /**
     * Shows a confirmation dialog before deleting a group.
     * @param group The group to delete.
     */
    onDeleteGroup(group: Group) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete the group "${group.name}"?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.confirmDelete(group.id),
            reject: () => {}
        });
    }

    /**
     * Deletes the selected group using an API call.
     * @param groupId The ID of the group to delete.
     */
    private confirmDelete(groupId: string) {
        this.groupsService
            .deleteGroup(groupId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Group deleted successfully.' });
                    this.getAllGroups();
                },
                error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete group.' })
            });
    }
}
