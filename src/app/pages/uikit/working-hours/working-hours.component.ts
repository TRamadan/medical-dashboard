import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { TableColumn, TableComponent } from '../../../shared/table/table.component';
import { LocationService } from '../add-location/services/location.service';
import { Services } from '../add-service/models/services';
import { SelectModule } from 'primeng/select';
import { AccordionModule } from 'primeng/accordion';
import { AssingHoursComponent } from './assing-hours/assing-hours.component';
import { UserManangementService } from '../add-user/services/user-manangement.service';
import { WorkinghoursService } from './services/workinghours.service';
import { ServicesService } from '../add-service/services/services.service';
import { TreeSelectModule } from 'primeng/treeselect';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
@Component({
    selector: 'app-working-hours',
    templateUrl: './working-hours.component.html',
    styleUrls: ['./working-hours.component.css'],
    providers: [MessageService, ConfirmationService],
    imports: [
        TooltipModule,
        ButtonModule,
        AccordionModule,
        Toast,
        ToolbarModule,
        TableModule,
        Dialog,
        DropdownModule,
        SelectModule,
        FormsModule,
        ReactiveFormsModule,
        Button,
        Card,
        TableComponent,
        AssingHoursComponent,
        ConfirmDialog,
        TreeSelectModule
    ]
})
export class WorkingHoursComponent implements OnInit {
    showWorkingHoursDialog: boolean = false;
    items: MenuItem[] | undefined;

    weekDays: any[] = [
        { label: 'Monday', value: '1' },
        { label: 'Tuesday', value: '2' },
        { label: 'Wednesday', value: '3' },
        { label: 'Thursday', value: '4' },
        { label: 'Friday', value: '5' },
        { label: 'Saturday', value: '6' },
        { label: 'Sunday', value: '7' }
    ];

    workingHoursForm!: FormGroup;

    isEdit: boolean = false;
    isDelete: boolean = false;

    workingHoursHeader: TableColumn[] = [];
    allWorkingHours: any[] = [];
    locations: Location[] = [];
    allUsers: any[] = [];
    serviceCategories: any[] = [];
    workingHoursToBeSent: any[] = [];
    expandedRows: any = {};
    workingHoursToEdit: any[] = [];

    constructor(
        private _fb: FormBuilder,
        private serviceCategoryService: ServicesService,
        private messageService: MessageService,
        private userService: UserManangementService,
        private _workingHoursService: WorkinghoursService,
        private confirmationService: ConfirmationService,
        private locationService: LocationService
    ) {
        this.items = [
            {
                label: 'Options',
                items: [
                    {
                        label: 'Update',
                        icon: 'pi pi-pen-to-square',
                        command: () => {
                            this.editSelectedWorkingHour('', '', '');
                        }
                    },
                    {
                        label: 'Delete',
                        icon: 'pi pi-trash',
                        command: () => {
                            this.deleteSelectedWorkingHour('', '');
                        }
                    }
                ]
            }
        ];
    }

    //here is the function needed to open a dialog needed to add a new working hours
    openAddWorkingHours(): void {
        this.showWorkingHoursDialog = true;
    }
    ngOnInit(): void {
        this.workingHoursForm = this._fb.group({
            id: [null],
            serviceId: [null, Validators.required],
            locationId: [null, Validators.required],
            doctorId: [null, Validators.required]
        });
        this.getAllLocations();
        this.getAllServicesCategory();
        this.getAllUsers();
        this.getAllAddedWorkingHours();

        this.workingHoursHeader = [
            {
                label: 'Working day',
                field: 'label',
                type: 'text'
            }
        ];
    }
    addTime(day: any) {
        day.times.push({ start: null, end: null });
    }

    //here is the function needed to close the dialog and rese all needed data
    hideDialog(): void {
        this.workingHoursForm.reset();
        this.isDelete = false;
        this.isEdit = false;
        this.showWorkingHoursDialog = false;
        this.workingHoursToEdit = [];
    }

    //here is the function needed to control working hours
    submitWorkingHours(): void {
        if (this.isEdit) {
            this.updateTheSelectedWorkingHour();
        } else {
            this.addNewWorkingHour();
        }
    }

    //here is the function needed to get all added user to asign working hours
    getAllUsers(): void {
        this.userService.getAllUsers().subscribe({
            next: (users: any) => {
                this.allUsers = users.data.map((user: any) => {
                    return {
                        id: user.id,
                        name: user.nameEn
                    };
                });
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch users.' });
            }
        });
    }

    //here is the function needed to get all needed added locations
    getAllLocations(): void {
        this.locationService.getLocations().subscribe({
            next: (res: any) => {
                this.locations = res.map((element: any) => {
                    return {
                        id: element.id,
                        name: element.nameEn
                    };
                });
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch locations' });
            }
        });
    }
    //here is the function needed to get all added services
    getAllServicesCategory(): void {
        this.serviceCategoryService.getServices().subscribe({
            next: (response: any) => {
                this.serviceCategories = response.data.map((category: any) => ({
                    key: `cat-${category.id}`,
                    label: category.nameEn,
                    children: category.subServices.map((service: any) => this.mapServiceToTreeNode(service))
                }));
                console.log(this.serviceCategories);
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to fetch Services'
                });
            }
        });
    }

    mapServiceToTreeNode(service: any): any {
        return {
            key: `srv-${service.id}`,
            label: service.nameEn, // or nameAr if you want Arabic
            children: (service.subServices || []).map((sub: any) => this.mapServiceToTreeNode(sub))
        };
    }

    //here is the function needed to get all added working hours from the child component
    onWorkingHoursChanged(event: any): void {
        let formValues = this.workingHoursForm.value;
        const serviceId = formValues.serviceId?.key ? +formValues.serviceId.key.split('-')[1] : 0;
        const result = event.map((e: any) => ({
            startTime: e.startTime,
            endTime: e.endTime,
            dayOfWeek: e.dayOfWeek,
            doctorId: formValues.doctorId ?? 0,
            locationId: formValues.locationId ?? 0,
            serviceId: serviceId
        }));
        this.workingHoursToBeSent = result;
    }

    //here is the function needed to get all added working hours
    getAllAddedWorkingHours(): void {
        this.allWorkingHours = [];
        this._workingHoursService.getWorkingHours().subscribe({
            next: (res: any[]) => {
                this.groupWorkingHours(res);
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch Working hours' });
            }
        });
    }

    groupWorkingHours(data: any[]) {
        const grouped = data.reduce((acc: any[], item: any) => {
            const dayInfo = this.weekDays.find((d) => d.value == item.dayOfWeek);

            let dayGroup = acc.find((g) => g.dayOfWeek === item.dayOfWeek);
            if (!dayGroup) {
                dayGroup = {
                    dayOfWeek: item.dayOfWeek,
                    label: dayInfo ? dayInfo.label : '',
                    value: dayInfo ? dayInfo.value : '',
                    locations: []
                };
                acc.push(dayGroup);
            }

            let locGroup = dayGroup.locations.find((l: any) => l.locationId === item.locationId);
            if (!locGroup) {
                locGroup = {
                    locationId: item.locationId,
                    locationNameEn: item.location.nameEn,
                    locationNameAr: item.location.nameAr,
                    items: [] // This will contain doctor + service groups
                };
                dayGroup.locations.push(locGroup);
            }

            let dsGroup = locGroup.items.find((i: any) => i.doctorNameEn === item.doctor.nameEn && i.serviceNameEn === item.service.nameEn);

            if (!dsGroup) {
                dsGroup = {
                    doctorNameEn: item.doctor.nameEn,
                    doctorId: item.doctorId,
                    serviceId: item.serviceId,
                    doctorNameAr: item.doctor.nameAr,
                    serviceNameEn: item.service.nameEn,
                    serviceNameAr: item.service.nameAr,
                    timeSlots: []
                };
                locGroup.items.push(dsGroup);
            }

            dsGroup.timeSlots.push({
                id: item.id,
                startTime: item.startTime,
                endTime: item.endTime,
                isActive: item.isActive
            });

            return acc;
        }, []);

        this.allWorkingHours = grouped;
        this.expandedRows = grouped.reduce((acc, curr) => {
            if (curr.locations && curr.locations.length > 0) {
                acc[curr.label] = true;
            }
            return acc;
        }, {});
        console.log(this.allWorkingHours);
    }

    //here is the function needed to add a new working hour
    addNewWorkingHour(): void {
        const body = this.workingHoursToBeSent;
        console.log(body);
        this._workingHoursService.addWorkingHours(body).subscribe({
            next: (res: any) => {
                debugger;
                this.getAllAddedWorkingHours();
                this.hideDialog();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Working hours created successfully.'
                });
            },
            error: (error: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Add working hour',
                    detail: 'Could not add new working hour. Please try again.'
                });
            }
        });
    }

    //here is the function needed to update the selected working hour
    updateTheSelectedWorkingHour(): void {
        const updateRequests = this.workingHoursToBeSent.map((slot) => {
            const existingSlot = this.workingHoursToEdit.find((s) => s.dayOfWeek === slot.dayOfWeek);
            const slotId = existingSlot ? existingSlot.id : null;
            return this._workingHoursService.updateWorkingHour(slot);
        });

        forkJoin(updateRequests).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Working hours updated successfully' });
                this.getAllAddedWorkingHours();
                this.hideDialog();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update working hours' })
        });
    }

    //here is the function needed to delete the selected working hour
    deleteSelectedWorkingHour(workingHour: any, item: any): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete all working hours for Dr. ${item.doctorNameEn} on ${workingHour.label}?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-danger',

            accept: () => {
                const deleteRequests = item.timeSlots.map((slot: any) => this._workingHoursService.deleteWorkingHour(slot.id));

                forkJoin(deleteRequests).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'All working hours for the day deleted successfully' });
                        this.getAllAddedWorkingHours();
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete working hours' })
                });
            }
        });
    }

    //here is the function needed to delete a single time slot
    deleteSingleTimeSlot(workingHour: any, item: any, slot: any): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete the time slot from ${slot.startTime} to ${slot.endTime} on ${workingHour.label} for Dr. ${item.doctorNameEn}?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-danger',
            accept: () => {
                this._workingHoursService.deleteWorkingHour(slot.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Time slot deleted successfully' });
                        this.getAllAddedWorkingHours();
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete time slot' })
                });
            }
        });
    }

    //here is the function needed to set the choosed working hour row needed to update
    selectedDayOfWeek: any = {};
    editSelectedWorkingHour(workingHour: any, item: any, location: any): void {
        this.showWorkingHoursDialog = true;
        this.isEdit = true;

        // Find the correct serviceId format for TreeSelect
        const serviceNode = this.findServiceNode(this.serviceCategories, item.serviceId);

        this.workingHoursForm.patchValue({
            serviceId: serviceNode,
            doctorId: item.doctorId,
            locationId: location.locationId
        });
        this.selectedDayOfWeek = Number(workingHour.value);

        this.workingHoursToEdit = item.timeSlots.map((slot: any) => ({ ...slot, dayOfWeek: Number(workingHour.value) }));
    }

    findServiceNode(nodes: any[], serviceId: number): any {
        for (const node of nodes) {
            const currentId = node.key ? +node.key.split('-')[1] : 0;
            if (node.key?.startsWith('srv-') && currentId === serviceId) {
                return node;
            }
            if (node.children) {
                const found = this.findServiceNode(node.children, serviceId);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }
}
