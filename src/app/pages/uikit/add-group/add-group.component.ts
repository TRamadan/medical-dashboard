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
import { ToastModule } from 'primeng/toast';
import { RolesService } from '../add-permission/services/roles.service';
import { RoleGroupService } from './services/roleGroup.service';

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
    private readonly messageService = inject(MessageService);
    private readonly rolesService = inject(RolesService);
    private readonly roleGroupService = inject(RoleGroupService);
    isEdit: boolean = false;
    isDelete: boolean = false;
    displayDialog: boolean = false;
    displayRoleGroupDialog: boolean = false;

    allGroups: Group[] = [];
    groupsArr: Group[] = [];
    allRoles: Role[] = [];
    addGroupForm!: FormGroup;
    addRoleGroupForm!: FormGroup;

    tableColumns: TableColumn[] = [];
    tableActions: TableAction[] = [];

    tableColumnsGroups: TableColumn[] = [];
    tableActionsGroups: TableAction[] = [];

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

        this.tableColumnsGroups = [
            { field: 'name', label: 'Group Name (EN)' },
            {
                field: 'nameAr',
                label: 'Groupe Name(Ar)'
            }
        ];

        this.tableActionsGroups = [{ label: 'Delete', icon: 'pi pi-trash', type: 'danger', onClick: (row: Group) => this.deleteSelectedGroup(row) }];
    }

    /**
     * Initializes the add group form.
     */
    private initializeForm(): void {
        this.addGroupForm = this.formBuilder.group({
            id: [''],
            name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
            nameAr: ['', [Validators.required, Validators.pattern(/^[\u0600-\u06FF\s]*$/)]]
        });

        this.addRoleGroupForm = this.formBuilder.group({
            id: [''],
            groupId: [''],
            roles: [[], Validators.required]
        });
    }

    /**
     * here is the function needed to close the dialog
     */
    hideDialog(): void {
        this.displayDialog = false;
        this.groupsArr = [];
        this.isDelete = false;
        this.isEdit = false;
        this.addGroupForm.reset();
    }

    /**
     * Fetches all groups from the API.
     */
    getAllGroups() {
        this.groupsService.getAllGroups().subscribe({
            next: (groups: any) => {
                this.allGroups = groups.data;
            },
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
        if (this.isEdit) {
            this.updateGroup();
        } else if (this.isDelete) {
            this.confirmDelete();
        } else {
            this.addGroup();
        }
    }

    /**
     * push more item in a table to send more than one group
     */

    pushMultipleGroup(): void {
        this.groupsArr.push({
            name: this.addGroupForm.controls['name'].value,
            nameAr: this.addGroupForm.controls['nameAr'].value
        });
        this.addGroupForm.reset();
    }

    /**
     * here is the function needed to delete the selected group before save
     */

    deleteSelectedGroup(group: Group) {
        this.groupsArr.splice(this.groupsArr.indexOf(group), 1);
    }

    /**
     * Adds a new group using an API call.
     */
    addGroup() {
        this.groupsService.addGroup(this.groupsArr).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Group added successfully.' });
                this.getAllGroups();
                this.hideDialog();
            },
            error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add group.' })
        });
    }

    /**
     * Updates the selected group using an API call.
     */
    updateGroup() {
        this.groupsService.updateGroup(this.addGroupForm.value).subscribe({
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
        this.isDelete = true;
        this.displayDialog = true;
        this.addGroupForm.controls['id'].setValue(group.id);
    }

    /**
     * Deletes the selected group using an API call.
     */
    confirmDelete() {
        let choosedGroupId = this.addGroupForm.controls['id'].value;
        this.groupsService.deleteGroup(choosedGroupId).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Group deleted successfully.' });
                this.getAllGroups();
                this.hideDialog();
            },
            error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete group.' })
        });
    }

    //here is the function needed to fetch all added roles
    getAllRoles(): void {
        this.rolesService.getAllRoles().subscribe({
            next: (res: any) => {
                this.allRoles = res.data.map((element: any) => ({
                    id: element.id,
                    name: element.name,
                    nameAr: element.nameAr
                })) as Role[];
            },
            error: (error: any) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Error while fetching roles, please try again later'
                });
            }
        });
    }

    /**
     * here is the function needed to open a dialog to add a roles to the added groups
     * @param group
     */
    addRoleGroup(group: Group): void {
        this.getAllRoles();
        this.addRoleGroupForm.controls['groupId'].setValue(group.id);
        this.displayRoleGroupDialog = true;
    }

    /**
     * here is the function needed to control the add role group for the selected group
     */
    saveRoleGroup(): void {
        const groupeId = this.addRoleGroupForm.controls['groupId'].value;
        const roleIds: string[] = this.addRoleGroupForm.controls['roles'].value;

        const body = roleIds.map((roleId) => ({ groupeId, roleId }));

        this.roleGroupService.addRoleGroup(body).subscribe({
            next: (res: any) => {
                this.displayRoleGroupDialog = false;
                this.addRoleGroupForm.reset();
            },
            error: (error: any) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Error while adding roles to the selected group, please try again later'
                });
            }
        });
    }
}
