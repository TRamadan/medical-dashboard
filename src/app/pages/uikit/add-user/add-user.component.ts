import { Component, OnInit } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableColumn, TableComponent } from '../../../shared/table/table.component';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, DatePipe } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { StepperModule } from 'primeng/stepper';
import { FileUploadModule } from 'primeng/fileupload';
import { UserManangementService } from './services/user-manangement.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { environment } from '../../../../environments/environment';
import { SharedService } from '../../../shared/services/shared.service';
import { Group } from '../add-group/models/group';
import { Roles } from '../add-permission/models/permission';
import { GroupsService } from '../add-group/services/groups.service';
import { RolesService } from '../add-permission/services/roles.service';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadInputComponent } from '../../../shared/file-upload-input/file-upload-input.component';
import { TabViewModule } from 'primeng/tabview';
import { DaysOffComponent } from './days-off/days-off.component';
import { DaysOffService } from './days-off/services/days-off.service';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'app-add-user',
    imports: [
        DaysOffComponent,
        FileUploadInputComponent,
        DropdownModule,
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
        DatePipe,
        MultiSelectModule,
        StepperModule,
        FileUploadModule,
        ToastModule,
        TabViewModule,
        TooltipModule,
        ConfirmDialogModule,
        CheckboxModule,
        RippleModule
    ],
    standalone: true,
    providers: [MessageService, ConfirmationService],
    templateUrl: './add-user.component.html',
    styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
    addNewUserForm!: FormGroup;
    allUsers: any[] = [];
    userDialog: boolean = false;
    isEdit: boolean = false;
    isDelete: boolean = false;
    isSaving: boolean = false;
    isEmployee: boolean = false;
    showPassword = false;
    detailsDialog: boolean = false;
    selectedUser: any;
    allRoles: Roles[] = [];
    allGroups: Group[] = [];
    allUserTypes: any[] = [];
    public readonly imgUrl = environment.imgUrl;

    daysOffDialog: boolean = false;
    selectedUserForDaysOff: any = null;
    selectedDayOffToEdit: any = null;

    constructor(
        private fb: FormBuilder,
        private userService: UserManangementService,
        private _messageService: MessageService,
        private _groupsService: GroupsService,
        private _rolesService: RolesService,
        private daysOffService: DaysOffService,
        private confirmationService: ConfirmationService
    ) { }

    openAddDayOffDialog(user: any) {
        this.selectedUserForDaysOff = user;
        this.selectedDayOffToEdit = null;
        this.daysOffDialog = true;
    }

    editDayOff(user: any, dayOff: any) {
        this.selectedUserForDaysOff = user;
        this.selectedDayOffToEdit = dayOff;
        this.daysOffDialog = true;
    }

    onDaysOffSaved() {
        this.daysOffDialog = false;
        this.onViewUserDaysOff(this.selectedUserForDaysOff);
    }

    confirmDeleteDayOff(user: any, dayOff: any) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this day off?',
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deleteDayOffAction(user, dayOff);
            }
        });
    }

    private deleteDayOffAction(user: any, dayOff: any) {
        this.daysOffService.deleteDaysOff(dayOff.id).subscribe({
            next: () => {
                this._messageService.add({ severity: 'success', summary: 'Success', detail: 'Day off deleted successfully.' });
                this.onViewUserDaysOff(user);
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete day off' });
            }
        });
    }

    onViewUserDaysOff(user: any) {
        if (user.showDetails) {
            this.daysOffService.getDayOffsByUserId(user.id).subscribe({
                next: (res: any) => {
                    user.daysOffList = res.data ?? res;
                },
                error: (err: any) => {
                    if (err.status === 400 || err.error?.status === 400) {
                        user.daysOffList = [];
                        this._messageService.add({ severity: 'info', summary: 'Info', detail: 'No days off added for the selected doctor' });
                    } else {
                        user.daysOffList = [];
                        this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch days off' });
                    }
                }
            });
        }
    }

    coachsHeader: TableColumn[] = [
        { label: 'Username', field: 'userName', type: 'text', sortable: true },
        { label: 'Name (AR)', field: 'nameAr', type: 'text', sortable: true },
        { label: 'Name (EN)', field: 'nameEn', type: 'text', sortable: true },
        { label: 'Email', field: 'email', type: 'text', sortable: true },
        { label: 'Phone Number', field: 'phoneNumber', type: 'text', sortable: true }
    ];
    genders: any[] = [
        { id: 1, name: 'Male' },
        { id: 2, name: 'Female' }
    ];

    ngOnInit() {
        this.getAllUsers();
        this.getAllRoles();
        this.getAllGroups();
        this.getAllUserTypes();
        this.initialiseUserForm();
    }

    getAllUserTypes(): void {
        this.userService.getAllUserTypes().subscribe({
            next: (userTypesResponse: any) => {
                this.allUserTypes = userTypesResponse;
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
            }
        });
    }

    initialiseUserForm(): void {
        this.addNewUserForm = this.fb.group({
            registerDTO: this.fb.group({
                userName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_]{3,20}$')]],
                nameAr: ['', [Validators.required, Validators.pattern('^[\u0621-\u064A\u0660-\u0669\\s]{3,}$')]],
                nameEn: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]{3,}$')]],
                email: ['', [Validators.required, Validators.email]],
                password: ['', [Validators.required, Validators.minLength(8)]],
                genderId: [null, Validators.required],
                rolesId: [[], Validators.required],
                groupesId: [[], Validators.required]
            }),
            employeeProfileDTO: this.fb.group({
                address: ['', Validators.required],
                employeeTypeId: [null, Validators.required],
                attachments: this.fb.array([])
            }),
            phones: this.fb.array([
                this.createPhoneGroup(true)
            ]),
            emergencyContacts: this.fb.array([
                this.createEmergencyContactGroup()
            ])
        });
    }

    createPhoneGroup(isPrimary: boolean = false): FormGroup {
        return this.fb.group({
            phoneNumber: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,15}$')]],
            isPrimary: [isPrimary],
            isWhatsApp: [false]
        });
    }

    createEmergencyContactGroup(): FormGroup {
        return this.fb.group({
            name: ['', Validators.required],
            phoneNumber: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,15}$')]]
        });
    }

    createAttachmentGroup(): FormGroup {
        return this.fb.group({
            description: ['', Validators.required],
            filePath: [null, Validators.required]
        });
    }

    get registerDTOGroup(): FormGroup {
        return this.addNewUserForm.get('registerDTO') as FormGroup;
    }

    get employeeProfileDTOGroup(): FormGroup {
        return this.addNewUserForm.get('employeeProfileDTO') as FormGroup;
    }

    get phonesArray(): FormArray {
        return this.addNewUserForm.get('phones') as FormArray;
    }

    get emergencyContactsArray(): FormArray {
        return this.addNewUserForm.get('emergencyContacts') as FormArray;
    }

    get attachmentsArray(): FormArray {
        return this.addNewUserForm.get('employeeProfileDTO.attachments') as FormArray;
    }

    addPhone(): void { this.phonesArray.push(this.createPhoneGroup()); }
    removePhone(index: number): void { this.phonesArray.removeAt(index); }

    addEmergencyContact(): void { this.emergencyContactsArray.push(this.createEmergencyContactGroup()); }
    removeEmergencyContact(index: number): void { this.emergencyContactsArray.removeAt(index); }

    addAttachment(): void { this.attachmentsArray.push(this.createAttachmentGroup()); }
    removeAttachment(index: number): void { this.attachmentsArray.removeAt(index); }

    openAddUserDialog(): void {
        this.isEdit = false;
        this.isDelete = false;
        this.selectedUser = null;
        this.initialiseUserForm();
        this.userDialog = true;
    }

    getAllUsers(): void {
        this.userService.getAllUsers().subscribe({
            next: (users: any) => {
                this.allUsers = users.data;
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
            }
        });
    }

    addNewUser(): void {
        if (this.addNewUserForm.invalid) {
            this.addNewUserForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const userPayload = this.addNewUserForm.value;

        this.userService.addUser(userPayload).subscribe({
            next: () => {
                this.isSaving = false;
                this.hideDialog();
                this.getAllUsers();
                this._messageService.add({ severity: 'success', summary: 'Success', detail: 'User created successfully.' });
            },
            error: (err) => {
                this.isSaving = false;
                this._messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
            }
        });
    }

    submitUser(): void {
        if (this.isEdit) {
            this.updateSelectedUser();
        } else if (this.isDelete) {
            this.confirmDeleteSelectedUser();
        } else {
            this.addNewUser();
        }
    }

    updateSelectedUser(): void {
        if (this.addNewUserForm.invalid) {
            this.addNewUserForm.markAllAsTouched();
            return;
        }

        const payload = this.addNewUserForm.value;
        if (!payload.registerDTO.password) {
            delete payload.registerDTO.password;
        }

        this.isSaving = true;
        this.userService.updateUser(this.selectedUser.id, payload).subscribe({
            next: () => {
                this.isSaving = false;
                this.hideDialog();
                this.getAllUsers();
                this._messageService.add({ severity: 'success', summary: 'Success', detail: 'User updated successfully.' });
            },
            error: (err) => {
                this.isSaving = false;
                this._messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
            }
        });
    }

    confirmDeleteSelectedUser(): void {
        if (!this.selectedUser) return;

        this.isSaving = true;
        this.userService.deleteUser(this.selectedUser.id).subscribe({
            next: () => {
                this.isSaving = false;
                this.hideDialog();
                this.getAllUsers();
                this._messageService.add({ severity: 'success', summary: 'Success', detail: 'User deleted successfully.' });
            },
            error: (err) => {
                this.isSaving = false;
                this._messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
            }
        });
    }

    editSelectedUser(user: any): void {
        this.userService.getUserById(user.id).subscribe({
            next: (res: any) => {
                const data = res?.data ?? res;
                this.selectedUser = { ...data, id: data.id ?? user.id };
                this.patchFormForEdit(data);
                this.isEdit = true;
                this.userDialog = true;
            },
            error: (err) => this._messageService.add({ severity: 'error', summary: 'Error', detail: err.message })
        });
    }

    private patchFormForEdit(data: any): void {
        if (!data) return;

        this.initialiseUserForm();

        const rolesId = Array.isArray(data.roles) ? data.roles.map((r: any) => r.id) : [];
        const groupesId = Array.isArray(data.groupes) ? data.groupes.map((g: any) => g.id) : [];

        this.registerDTOGroup.patchValue({
            userName: data.userName ?? '',
            nameAr: data.nameAr ?? '',
            nameEn: data.nameEn ?? '',
            email: data.email ?? '',
            password: '', 
            genderId: data.genderId ?? null,
            rolesId,
            groupesId
        });

        this.registerDTOGroup.get('password')?.clearValidators();
        this.registerDTOGroup.get('password')?.updateValueAndValidity();

        const emp = data.employeeProfileDTO ?? data.employeeProfile ?? data.employeeData ?? {};
        this.employeeProfileDTOGroup.patchValue({
            address: emp.address ?? '',
            employeeTypeId: emp.employeeTypeId ?? data.employeeTypeId ?? emp.userType ?? null
        });

        const phones = data.phones ?? [];
        if (phones.length > 0) {
            this.phonesArray.clear();
            phones.forEach((p: any) => {
                this.phonesArray.push(this.fb.group({
                    phoneNumber: [p.phoneNumber ?? '', [Validators.required, Validators.pattern('^\\+?[0-9]{10,15}$')]],
                    isPrimary: [p.isPrimary ?? false],
                    isWhatsApp: [p.isWhatsApp ?? false]
                }));
            });
        }

        const emergencyContacts = data.emergencyContacts ?? [];
        if (emergencyContacts.length > 0) {
            this.emergencyContactsArray.clear();
            emergencyContacts.forEach((e: any) => {
                this.emergencyContactsArray.push(this.fb.group({
                    name: [e.name ?? '', Validators.required],
                    phoneNumber: [e.phoneNumber ?? '', [Validators.required, Validators.pattern('^\\+?[0-9]{10,15}$')]]
                }));
            });
        }

        const attachments = emp.attachments ?? data.attachments ?? [];
        if (attachments.length > 0) {
            this.attachmentsArray.clear();
            attachments.forEach((att: any) => {
                this.attachmentsArray.push(this.fb.group({
                    description: [att.description ?? '', Validators.required],
                    filePath: [att.filePath ?? att.file ?? null, Validators.required]
                }));
            });
        }
    }

    deleteSelectedUser(user: any): void {
        this.selectedUser = user;
        this.isDelete = true;
        this.userDialog = true;
    }

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
        this.userService.getUserById(user.id).subscribe({
            next: (res: any) => {
                const data = res?.data ?? res;
                this.selectedUser = { ...data, id: data.id ?? user.id };
                this.detailsDialog = true;
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch user details' });
            }
        });
    }

    hideDialog(): void {
        this.isEdit = false;
        this.isEmployee = false;
        this.isDelete = false;
        this.addNewUserForm.reset();
        this.userDialog = false;
    }
}
