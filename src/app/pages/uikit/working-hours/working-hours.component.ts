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
import { CarouselModule } from 'primeng/carousel';
@Component({
    selector: 'app-working-hours',
    templateUrl: './working-hours.component.html',
    styleUrls: ['./working-hours.component.css'],
    providers: [MessageService, ConfirmationService],
    imports: [
        CarouselModule,
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
    isSaving: boolean = false;
    isDeleting: boolean = false;

    workingHoursHeader: TableColumn[] = [];
    allWorkingHours: any[] = [];
    locations: Location[] = [];
    allUsers: any[] = [];
    serviceCategories: any[] = [];
    workingHoursToBeSent: any[] = [];
    expandedRows: any = {};
    workingHoursToEdit: any[] = [];
    selectedUserId: any = null;
    flatDialogUserWorkingHours: any[] = [];
    carouselResponsiveOptions: any[] | undefined;

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
            serviceId: [null],
            locationId: [null],
            doctorId: [null, Validators.required]
        });

        this.carouselResponsiveOptions = [
            {
                breakpoint: '1024px',
                numVisible: 3,
                numScroll: 1
            },
            {
                breakpoint: '768px',
                numVisible: 2,
                numScroll: 1
            },
            {
                breakpoint: '560px',
                numVisible: 1,
                numScroll: 1
            }
        ];

        this.getAllLocations();
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

        // Reset the assigned hours UI in the dialog
        this.dialogUserWorkingHours = [];
        this.flatDialogUserWorkingHours = [];
        this.serviceCategories = [];
        this.workingHoursForm.get('doctorId')?.setValue(null);
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
                this.serviceCategories = response.data.map((category: any) => {
                    const hasChildren = category.subServices && category.subServices.length > 0;
                    const node: any = {
                        key: `srv-${category.id}`,
                        label: category.nameEn,
                        selectable: !hasChildren
                    };
                    if (hasChildren) {
                        node.children = category.subServices.map((service: any) => this.mapServiceToTreeNode(service));
                    }
                    return node;
                });
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
        const hasChildren = service.subServices && service.subServices.length > 0;
        const node: any = {
            key: `srv-${service.id}`,
            label: service.nameEn, // or nameAr if you want Arabic
            selectable: !hasChildren
        };
        if (hasChildren) {
            node.children = service.subServices.map((sub: any) => this.mapServiceToTreeNode(sub));
        }
        return node;
    }

    //here is the function needed to get all added working hours from the child component
    onWorkingHoursChanged(event: any): void {
        this.workingHoursToBeSent = event;
    }

    //here is the function needed to get all added working hours
    getAllAddedWorkingHours(): void {

        this.allWorkingHours = [];
        this.expandedRows = {};

        const fetchObservable = this.selectedUserId
            ? this._workingHoursService.getWorkingHoursByUserId(this.selectedUserId)
            : this._workingHoursService.getWorkingHours();

        fetchObservable.subscribe({
            next: (res: any[]) => {

                this.groupWorkingHours(res);
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch Working hours' });
            }
        });
    }

    onUserChange(): void {
        this.getAllAddedWorkingHours();
    }

    dialogUserWorkingHours: any[] = [];

    onDialogUserChange(event: any): void {
        const userId = event.value;
        if (!userId) {
            this.dialogUserWorkingHours = [];
            this.flatDialogUserWorkingHours = [];
            this.serviceCategories = [];
            return;
        }

        // 1. Fetch Working Hours
        this._workingHoursService.getWorkingHoursByUserId(userId).subscribe({
            next: (res: any[]) => {
                this.dialogUserWorkingHours = this.groupWorkingHoursData(res);
                this.flatDialogUserWorkingHours = res.map(item => {
                    const dayInfo = this.weekDays.find((d) => d.value == item.dayOfWeek);
                    return {
                        ...item,
                        dayLabel: dayInfo ? dayInfo.label : ''
                    };
                });
            },
            error: (error: any) => {
                // If it's a 404 block, it simply means no hours assigned yet per requirements
                if (error.status === 404) {
                    this.dialogUserWorkingHours = [];
                    this.flatDialogUserWorkingHours = [];
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch Working hours for selected user' });
                }
            }
        });

        // 2. Fetch Assigned Services
        this._workingHoursService.getAssignedServicesForUser(userId).subscribe({
            next: (response: any) => {
                const servicesData = response.data || response;
                if (!servicesData || servicesData.length === 0) {
                    this.serviceCategories = [];
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'No Services',
                        detail: 'There are no services assigned for the selected user. Please assign services first.'
                    });
                    return;
                }

                this.serviceCategories = servicesData.map((category: any) => {
                    const hasChildren = category.subServices && category.subServices.length > 0;
                    const node: any = {
                        key: `srv-${category.id}`,
                        label: category.nameEn,
                        selectable: !hasChildren
                    };
                    if (hasChildren) {
                        node.children = category.subServices.map((service: any) => this.mapServiceToTreeNode(service));
                    }
                    return node;
                });
            },
            error: (error: any) => {
                if (error.status !== 404) {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch assigned services for user' });
                } else {
                    this.serviceCategories = [];
                    this.messageService.add({ severity: 'warn', summary: 'No Services', detail: 'There are no services assigned for the selected user.' });
                }
            }
        });
    }

    groupWorkingHours(data: any[]) {
        this.allWorkingHours = this.groupWorkingHoursData(data);
        this.expandedRows = this.allWorkingHours.reduce((acc, curr) => {
            if (curr.locations && curr.locations.length > 0) {
                acc[curr.label] = true;
            }
            return acc;
        }, {});
        console.log(this.allWorkingHours);
    }

    groupWorkingHoursData(data: any[]): any[] {
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
                    locationNameEn: item.locationNameEn,
                    locationNameAr: item.locationNameAr,
                    items: [] // This will contain doctor + service groups
                };
                dayGroup.locations.push(locGroup);
            }

            let dsGroup = locGroup.items.find((i: any) => i.doctorNameEn === item.doctorNameEn && i.serviceNameEn === item.serviceNameEn);

            if (!dsGroup) {
                dsGroup = {
                    doctorNameEn: item.doctorNameEn,
                    doctorId: item.doctorId,
                    serviceId: item.serviceId,
                    doctorNameAr: item.doctorNameAr,
                    serviceNameEn: item.serviceNameEn,
                    serviceNameAr: item.serviceNameAr,
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

        return grouped;
    }

    //here is the function needed to add a new working hour
    addNewWorkingHour(): void {

        this.isSaving = true;
        let formValues = this.workingHoursForm.value;

        let serviceIds: number[] = [];
        let locationId = 0;

        const firstSlot = this.workingHoursToBeSent[0];
        if (firstSlot) {
            locationId = firstSlot.locationId ?? 0;
            const slotServiceId = firstSlot.serviceId;
            
            if (Array.isArray(slotServiceId)) {
                serviceIds = slotServiceId
                    .filter((node: any) => node.key && node.key.toString().startsWith('srv-'))
                    .map((node: any) => parseInt(node.key.toString().split('-')[1], 10));
            }
            else if (typeof slotServiceId === 'object' && slotServiceId !== null) {
                if (slotServiceId.key && slotServiceId.key.toString().startsWith('srv-')) {
                    serviceIds = [parseInt(slotServiceId.key.toString().split('-')[1], 10)];
                } else {
                    for (const key of Object.keys(slotServiceId)) {
                        if (key.toString().startsWith('srv-')) {
                            const val = slotServiceId[key];
                            if (val === true || (val && val.checked === true)) {
                                serviceIds.push(parseInt(key.toString().split('-')[1], 10));
                            }
                        } else if (slotServiceId[key] && slotServiceId[key].key && slotServiceId[key].key.toString().startsWith('srv-')) {
                            serviceIds.push(parseInt(slotServiceId[key].key.toString().split('-')[1], 10));
                        }
                    }
                }
            }
        }

        const slots = this.workingHoursToBeSent.map((e: any) => ({
            dayOfWeek: Number(e.dayOfWeek),
            startTime: e.startTime,
            endTime: e.endTime
        }));

        const body: any = {
            doctorId: formValues.doctorId ?? 0,
            locationId: locationId,
            serviceIds: serviceIds,
            slots: slots
        };
        console.log("Submitting Request Body: ", JSON.stringify(body));
        this._workingHoursService.addWorkingHours(body).subscribe({
            next: (res: any) => {
                this.isSaving = false;
                this.getAllAddedWorkingHours();
                this.hideDialog();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Working hours created successfully.'
                });
            },
            error: (error: any) => {
                this.isSaving = false;
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
        this.isSaving = true;
        let formValues = this.workingHoursForm.value;

        const updateRequests = this.workingHoursToBeSent.map((slot: any) => {
            const existingSlot = this.workingHoursToEdit.find((s: any) => s.dayOfWeek === slot.dayOfWeek);
            const slotId = existingSlot ? existingSlot.id : null;

            let serviceId = 0;
            const slotServiceId = slot.serviceId;

            if (Array.isArray(slotServiceId)) {
                const firstSrv = slotServiceId.find((n: any) => n.key && n.key.toString().startsWith('srv-'));
                if (firstSrv) serviceId = parseInt(firstSrv.key.toString().split('-')[1], 10);
            } else if (typeof slotServiceId === 'object' && slotServiceId !== null) {
                if (slotServiceId.key && slotServiceId.key.toString().startsWith('srv-')) {
                    serviceId = parseInt(slotServiceId.key.toString().split('-')[1], 10);
                } else {
                    for (const key of Object.keys(slotServiceId)) {
                        if (key.toString().startsWith('srv-')) {
                            const val = slotServiceId[key];
                            if (val === true || (val && val.checked === true)) {
                                serviceId = parseInt(key.toString().split('-')[1], 10);
                                break;
                            }
                        } else if (slotServiceId[key] && slotServiceId[key].key && slotServiceId[key].key.toString().startsWith('srv-')) {
                            serviceId = parseInt(slotServiceId[key].key.toString().split('-')[1], 10);
                            break;
                        }
                    }
                }
            }

            return this._workingHoursService.updateWorkingHour({
                id: slotId,
                startTime: slot.startTime,
                endTime: slot.endTime,
                dayOfWeek: slot.dayOfWeek,
                doctorId: formValues.doctorId ?? 0,
                locationId: slot.locationId ?? 0,
                serviceId: serviceId
            });
        });

        forkJoin(updateRequests).subscribe({
            next: () => {
                this.isSaving = false;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Working hours updated successfully' });
                this.getAllAddedWorkingHours();
                this.hideDialog();
            },
            error: () => {
                this.isSaving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update working hours' });
            }
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
                this.isDeleting = true;
                const deleteRequests = item.timeSlots.map((slot: any) => this._workingHoursService.deleteWorkingHour(slot.id));

                forkJoin(deleteRequests).subscribe({
                    next: () => {
                        this.isDeleting = false;
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'All working hours for the day deleted successfully' });
                        this.getAllAddedWorkingHours();
                    },
                    error: () => {
                        this.isDeleting = false;
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete working hours' });
                    }
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
                this.isDeleting = true;
                this._workingHoursService.deleteWorkingHour(slot.id).subscribe({
                    next: () => {
                        this.isDeleting = false;
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Time slot deleted successfully' });
                        this.getAllAddedWorkingHours();
                    },
                    error: () => {
                        this.isDeleting = false;
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete time slot' });
                    }
                });
            }
        });
    }

    //here is the function needed to set the choosed working hour row needed to update
    selectedDayOfWeek: any = {};
    editSelectedWorkingHour(workingHour: any, item: any, location: any): void {
        this.showWorkingHoursDialog = true;
        this.isEdit = true;

        this.selectedDayOfWeek = Number(workingHour.value);
        this.workingHoursToEdit = item.timeSlots.map((slot: any) => ({ ...slot, dayOfWeek: Number(workingHour.value), locationId: location.locationId }));

        this.workingHoursForm.patchValue({
            doctorId: item.doctorId
        });

        // 1. Fetch Working Hours for display
        this._workingHoursService.getWorkingHoursByUserId(item.doctorId).subscribe({
            next: (res: any[]) => {
                this.dialogUserWorkingHours = this.groupWorkingHoursData(res);
                this.flatDialogUserWorkingHours = res.map(i => {
                    const dayInfo = this.weekDays.find((d) => d.value == i.dayOfWeek);
                    return { ...i, dayLabel: dayInfo ? dayInfo.label : '' };
                });
            },
            error: () => {
                this.dialogUserWorkingHours = [];
                this.flatDialogUserWorkingHours = [];
            }
        });

        // 2. Fetch Assigned Services to select the node
        this._workingHoursService.getAssignedServicesForUser(item.doctorId).subscribe({
            next: (response: any) => {
                const servicesData = response.data || response;
                if (!servicesData || servicesData.length === 0) {
                    this.serviceCategories = [];
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'No Services',
                        detail: 'There are no services assigned for the selected user. Please assign services first.'
                    });
                } else {
                    this.serviceCategories = servicesData.map((category: any) => {
                        const hasChildren = category.subServices && category.subServices.length > 0;
                        const node: any = {
                            key: `srv-${category.id}`,
                            label: category.nameEn,
                            selectable: !hasChildren
                        };
                        if (hasChildren) {
                            node.children = category.subServices.map((service: any) => this.mapServiceToTreeNode(service));
                        }
                        return node;
                    });
                }

                // Find the correct serviceId format for TreeSelect
                const targetKey = `srv-${item.serviceId}`;
                const serviceNode = this.findServiceNodeByKey(this.serviceCategories, targetKey);

                this.workingHoursToEdit = this.workingHoursToEdit.map(slot => ({
                    ...slot,
                    serviceId: serviceNode ? [serviceNode] : []
                }));
            },
            error: () => {
                this.serviceCategories = [];
            }
        });
    }

    findServiceNodeByKey(nodes: any[], targetKey: string): any {
        if (!nodes) return null;
        for (const node of nodes) {
            if (node.key === targetKey) {
                return node;
            }
            if (node.children) {
                const found = this.findServiceNodeByKey(node.children, targetKey);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }
}
