import { Component, OnInit } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableColumn, TableComponent } from '../../../shared/table/table.component';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { Group } from '../add-group/models/group';
import { Roles } from '../add-permission/models/permission';
import { GroupsService } from '../add-group/services/groups.service';
import { RolesService } from '../add-permission/services/roles.service';
import { SelectModule } from 'primeng/select';
import { FileUploadInputComponent } from '../../../shared/file-upload-input/file-upload-input.component';
@Component({
    selector: 'app-add-user',
    imports: [
        FileUploadInputComponent,
        SelectModule,
        InputTextModule,
        FormsModule,
        ReactiveFormsModule,
        FloatLabelModule,
        DialogModule,
        TableComponent,
        ToolbarModule,
        ButtonModule,
        CardModule,
        NgClass,
        MultiSelectModule,
        StepperModule,
        FileUploadModule,
        ToastModule
    ],
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
    allRoles: Roles[] = [];
    allGroups: Group[] = [];
    allUserTypes: any[] = [];
    public readonly imgUrl = environment.imgUrl;

    constructor(
        private fb: FormBuilder,
        private userService: UserManangementService,
        private _messageService: MessageService,
        private _uploadFileService: SharedService,
        private _groupsService: GroupsService,
        private _rolesService: RolesService
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
        this.getAllUserTypes();
        this.initialiseUserForm();
    }

    //here is the function needed to get all user types
    getAllUserTypes(): void {
        this.userService.getAllUserTypes().subscribe({
            next: (users: any) => {
                this.allUserTypes = users.data;
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch users types.' });
            }
        });
    }

    //here is the function needed to initialise the form related for add a new user
    initialiseUserForm(): void {
        this.addNewUserForm = this.fb.group({
            personalData: this.fb.group({
                userName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_]{3,20}$')]],
                nameAr: ['', [Validators.required, Validators.pattern('^[\u0621-\u064A\u0660-\u0669\\s]{3,}$')]],
                nameEn: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]{3,}$')]],
                email: ['', [Validators.required, Validators.email]],
                phoneNumber: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,15}$'), Validators.maxLength(11)]],
                password: ['', [Validators.required, Validators.minLength(8)]],
                rolesId: [[], Validators.required],
                groupesId: [[], Validators.required],
                employeeType: [null, Validators.required]
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
            }),
            otherAttachments: this.fb.array([])
        });
    }

    get personalData(): AbstractControl {
        return this.addNewUserForm.get('personalData')!;
    }

    get employeeData(): AbstractControl {
        return this.addNewUserForm.get('employeeData')!;
    }

    get otherAttachments(): FormArray {
        return this.addNewUserForm.get('otherAttachments') as FormArray;
    }

    addAttachment(): void {
        const attachmentForm = this.fb.group({
            description: ['', Validators.required],
            file: [null, Validators.required]
        });
        this.otherAttachments.push(attachmentForm);
    }

    removeAttachment(index: number): void {
        if (this.otherAttachments.length > 0) {
            this.otherAttachments.removeAt(index);
        }
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
        // Combine form data from both steps
        const userPayload = {
            registerDTO: {
                ...this.addNewUserForm.value.personalData
            },
            employeeProfileDTO: {
                ...this.addNewUserForm.value.employeeData,
                attachments: this.addNewUserForm.value.otherAttachments.map((att: any) => ({
                    filePath: att.file,
                    description: att.description
                }))
            }
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

    /**
     * here is the function needed that control the add,edit and delete for the user
     */

    submitUser(): void {
        if (this.isEdit) {
            this.updateSelectedUser();
        } else if (this.isDelete) {
            this.confirmDeleteSelectedUser();
        } else {
            this.addNewUser();
        }
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
        this._rolesService.getAllRoles().subscribe({
            next: (res: any) => {
                this.allRoles = res.data.map((role: any) => {
                    return {
                        id: role.id,
                        name: role.name
                    };
                });
            },
            error: (error: any) => {
                this._messageService.add({
                    severity: 'error',
                    detail: 'Error while fetching added roles, please try again'
                });
            }
        });
    }

    //here is the function needed to fetch all added groups
    getAllGroups(): void {
        this._groupsService.getAllGroups().subscribe({
            next: (res: any) => {
                this.allGroups = res.data.map((group: any) => {
                    return {
                        id: group.id,
                        name: group.name
                    };
                });
            },
            error: (error: any) => {
                this._messageService.add({
                    severity: 'An error occured',
                    detail: 'Error on fetching added groups'
                });
            }
        });
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
    onImageUpload(event: any, controlName: string, index?: number): void {
        const file = event.target.files[0];

        if (file) {
            this._uploadFileService.uploadFileService(file, 'Users').subscribe({
                next: (res: any) => {
                    let formGroup: AbstractControl | null;
                    if (index !== undefined) {
                        formGroup = this.otherAttachments.at(index);
                    } else {
                        formGroup = this.addNewUserForm.get('employeeData');
                    }

                    if (formGroup) {
                        formGroup.get(controlName)?.patchValue(res.filePath);
                    }

                    // preview اختياري
                    const reader = new FileReader();
                    reader.onload = (e: any) => {
                        // This part seems to be for local preview, which might not be what you want when you get a filePath from the service.
                        // If you want to store the file path, the line below should be removed or adjusted.
                        // formGroup?.get(controlName)?.patchValue(e.target.result);
                    };
                    reader.readAsDataURL(file);
                    this._messageService.add({ severity: 'success', summary: 'Success', detail: 'Image uploaded successfully.' });
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
