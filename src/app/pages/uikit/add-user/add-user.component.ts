import { Component, OnInit } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableComponent, TableColumn } from '../../../shared/table/table.component';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { NgClass } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { StepperModule } from 'primeng/stepper';
import { FileUploadModule } from 'primeng/fileupload';
import { UserManangementService } from './services/user-manangement.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { environment } from '../../../../environments/environment';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
    selector: 'app-add-user',
    imports: [InputTextModule, FormsModule, ReactiveFormsModule, FloatLabelModule, DialogModule, TableComponent, ToolbarModule, ButtonModule, CardModule, NgClass, MultiSelectModule, StepperModule, FileUploadModule, ToastModule],
    standalone: true,
    providers: [MessageService],
    templateUrl: './add-user.component.html',
    styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
    addNewUserForm!: FormGroup;
    allUsers: any[] = [];
    userDialog: boolean = false;
    isEdit: boolean = false;
    isDelete: boolean = false;
    isEmployee: boolean = false;
    showPassword = false;
    detailsDialog: boolean = false;
    selectedUser: any;
    allRoles: any[] = [];
    allGroups: any[] = [];
    public readonly imgUrl = environment.imgUrl;

    constructor(
        private fb: FormBuilder,
        private userService: UserManangementService,
        private _messageService: MessageService,
        private _uploadFileService: SharedService
    ) {}

    coachsHeader: TableColumn[] = [
        { label: 'Username', field: 'username', type: 'text', sortable: true },
        { label: 'Name (AR)', field: 'nameAr', type: 'text', sortable: true },
        { label: 'Name (EN)', field: 'nameEn', type: 'text', sortable: true },
        { label: 'Email', field: 'email', type: 'text', sortable: true },
        { label: 'Phone Number', field: 'phoneNumber', type: 'text', sortable: true }
    ];

    ngOnInit() {
        this.getAllUsers();
        this.getAllRoles();
        this.getAllGroups();
        this.initialiseUserForm();
    }

    //here is the function needed to initialise the form related for add a new user
    initialiseUserForm(): void {
        this.addNewUserForm = this.fb.group({
            personalData: this.fb.group({
                userName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_]{3,20}$')]],
                nameAr: ['', [Validators.required, Validators.pattern('^[\u0621-\u064A\u0660-\u0669\\s]{3,}$')]],
                nameEn: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]{3,}$')]],
                email: ['', [Validators.required, Validators.email]],
                phoneNumber: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,15}$')]],
                password: ['', [Validators.required, Validators.minLength(8)]],
                rolesId: [[], Validators.required],
                groupesId: [[], Validators.required]
            }),
            employeeData: this.fb.group({
                fullNameAr: ['', [Validators.required, Validators.pattern('^[\u0621-\u064A\u0660-\u0669\\s]{3,}$')]],
                fullNameEn: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]{3,}$')]],
                whatsappNumber: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,15}$')]],
                argentNumber1: ['', Validators.pattern('^\\+?[0-9]{10,15}$')],
                argentNumber2: ['', Validators.pattern('^\\+?[0-9]{10,15}$')],
                address: ['', Validators.required],
                nationalIDImage: [null],
                birthstatementImage: [null],
                civilStatusStatemntImage: [null],
                educationalqualificationImage: [null],
                malitaryStatusImage: [null]
            })
        });
    }

    get personalData(): AbstractControl {
        return this.addNewUserForm.get('personalData')!;
    }

    get employeeData(): AbstractControl {
        return this.addNewUserForm.get('employeeData')!;
    }

    //here is the function needed to open a dialog for add a new user
    openAddUserDialog(): void {
        this.userDialog = true;
    }

    //here is the function needed to get all added users
    getAllUsers(): void {
        this.userService.getAllUsers().subscribe({
            next: (users: any) => {
                this.allUsers = users.data;
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch users.' });
            }
        });
    }

    //here is the function needed to add a new user
    addNewUser(): void {
        if (this.addNewUserForm.invalid) {
            return;
        }
        // Combine form data from both steps
        const userPayload = {
            ...this.addNewUserForm.value.personalData,
            ...this.addNewUserForm.value.employeeData
        };

        this.userService.addUser(userPayload).subscribe({
            next: () => {
                this.hideDialog();
                this.getAllUsers();
                this._messageService.add({ severity: 'success', summary: 'Success', detail: 'User created successfully.' });
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create user.' });
            }
        });
    }

    //here is the function needed to update the selected user
    updateSelectedUser(): void {
        if (this.addNewUserForm.invalid || !this.selectedUser) {
            return;
        }
        const userPayload = {
            ...this.addNewUserForm.value.personalData,
            ...this.addNewUserForm.value.employeeData
        };

        this.userService.updateUser(this.selectedUser.id, userPayload).subscribe({
            next: () => {
                this.hideDialog();
                this.getAllUsers();
                this._messageService.add({ severity: 'success', summary: 'Success', detail: 'User updated successfully.' });
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user.' });
            }
        });
    }

    //here is the fucntion needed to delete or deactive the selected user
    confirmDeleteSelectedUser(): void {
        if (!this.selectedUser) return;

        this.userService.deleteUser(this.selectedUser.id).subscribe({
            next: () => {
                this.hideDialog();
                this.getAllUsers();
                this._messageService.add({ severity: 'success', summary: 'Success', detail: 'User deleted successfully.' });
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete user.' });
                console.error(err);
            }
        });
    }

    //here is the function needed to open a dialog responsible for edit the selected user
    editSelectedUser(user: any): void {
        this.userService.getUserById(user.id).subscribe({
            next: (fullUser) => {
                this.selectedUser = fullUser;
                this.addNewUserForm.patchValue(fullUser);
                this.isEdit = true;
                this.userDialog = true;
            },
            error: (err) => this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch user details.' })
        });
    }

    //here is the function needed to open a dialog responsible for confirm deactive the selected user
    deleteSelectedUser(user: any): void {
        this.selectedUser = user;
        this.isDelete = true;
        this.userDialog = true; // Open the same dialog, but it will show the delete confirmation
    }

    //here is the function needed to fetch all added roles
    getAllRoles(): void {
        this.allRoles = [
            { label: 'Admin', value: '1' },
            { label: 'Coach', value: '2' },
            { label: 'User', value: '3' }
        ];
    }

    //here is the function needed to fetch all added groups
    getAllGroups(): void {
        this.allGroups = [
            { label: 'Group A', value: 'A' },
            { label: 'Group B', value: 'B' },
            { label: 'Group C', value: 'C' }
        ];
    }

    showUserDetails(user: any) {
        this.selectedUser = user;
        this.detailsDialog = true;
    }

    //here is the function needed to close the modal and rese all flags
    hideDialog(): void {
        this.isEdit = false;
        this.isEmployee = false;
        this.isDelete = false;
        this.addNewUserForm.reset();
        this.userDialog = false;
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Handle image upload and preview
     * @param event The file upload event
     */
    onImageUpload(event: any, controlName: string): void {
        const file = event.target.files[0];

        if (file) {
            this._uploadFileService.uploadFileService(file, 'Users').subscribe({
                next: (res: any) => {
                    const employeeGroup = this.addNewUserForm.get('employeeData');

                    if (employeeGroup) {
                        employeeGroup.get(controlName)?.patchValue(res.filePath);
                    }

                    // preview اختياري
                    const reader = new FileReader();
                    reader.onload = (e: any) => {
                        employeeGroup?.get(controlName)?.patchValue(e.target.result);
                    };
                    reader.readAsDataURL(file);

                    this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch users.' });
                },
                error: (err: any) => {
                    this._messageService.add({
                        severity: 'error',
                        summary: 'Upload Failed',
                        detail: `Could not upload ${controlName}. Please try again.`
                    });
                    console.error(`❌ Error uploading ${controlName}:`, err);
                }
            });
        }
    }
}
