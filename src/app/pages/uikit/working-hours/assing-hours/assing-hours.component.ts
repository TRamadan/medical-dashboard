import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { SelectModule } from 'primeng/select';
import { TreeSelectModule } from 'primeng/treeselect';
import { CheckboxModule } from 'primeng/checkbox';
import { Button } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-assing-hours',
    templateUrl: './assing-hours.component.html',
    styleUrls: ['./assing-hours.component.css'],
    imports: [
        AccordionModule,
        FormsModule,
        ReactiveFormsModule,
        SelectModule,
        TreeSelectModule,
        Button,
        CheckboxModule,
        Toast,
        ProgressSpinnerModule,
        TooltipModule
    ],
    providers: [MessageService]
})
export class AssingHoursComponent implements OnInit {
    workingHoursForm!: FormGroup;

    @Input() selectedDayOfWeek!: number;
    @Input() workingHoursToEdit: any[] = [];
    @Input() assignedWorkingHours: any[] = [];
    @Input() hasDoctorSelected: boolean = false;
    @Input() isEdit: boolean = false;
    @Input() isSaving: boolean = false;
    @Input() isLoadingHours: boolean = false;
    @Input() isLoadingServices: boolean = false;
    @Input() locations: any[] = [];
    @Input() serviceCategories: any[] = [];

    @Output() workingHoursChanged = new EventEmitter<any[]>();
    @Output() saveClicked = new EventEmitter<void>();

    durationOptions: { label: string; value: string }[] = [];
    applyToAllDays: boolean = false;

    weekDays: any[] = [
        { label: 'Monday', value: '1', times: [] },
        { label: 'Tuesday', value: '2', times: [] },
        { label: 'Wednesday', value: '3', times: [] },
        { label: 'Thursday', value: '4', times: [] },
        { label: 'Friday', value: '5', times: [] },
        { label: 'Saturday', value: '6', times: [] },
        { label: 'Sunday', value: '7', times: [] }
    ];

    activeDayIndex: number = 0;

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService
    ) { }

    selectDay(dayIndex: number): void {
        this.activeDayIndex = dayIndex;
    }

    calculateDuration(startTime: string | null | undefined, endTime: string | null | undefined): string {
        if (!startTime || !endTime) return '';
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const diffMinutes = (endH * 60 + (endM || 0)) - (startH * 60 + (startM || 0));
        if (diffMinutes <= 0) return '';
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        if (hours > 0 && minutes > 0) {
            return `${hours} hrs ${minutes} mins`;
        } else if (hours > 0) {
            return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
        } else {
            return `${minutes} mins`;
        }
    }

    getSlotTitle(index: number): string {
        return `Slot ${index + 1}`;
    }

    getSlotColor(index: number): string {
        const colors = ['#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899'];
        return colors[index % colors.length];
    }

    hasMultipleServices(serviceId: any): boolean {
        if (!serviceId) return false;
        if (Array.isArray(serviceId)) {
            return serviceId.length > 1;
        }
        if (typeof serviceId === 'object' && serviceId !== null) {
            const keys = Object.keys(serviceId).filter(k => serviceId[k] === true || (serviceId[k] && serviceId[k].checked));
            return keys.length > 1;
        }
        return false;
    }

    ngOnInit(): void {
        this.InitialiseFormArray();
        this.generateDurationOptions();

        this.workingHoursForm.valueChanges.subscribe(() => {
            const currentData = this.buildPayload();
            this.workingHoursChanged.emit(currentData);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['assignedWorkingHours']) {
            if (this.workingHoursForm && this.daysArray && !this.isEdit) {
                (this.daysArray.controls as FormGroup[]).forEach((dayCtrl: FormGroup) => {
                    const workingHours = dayCtrl.get('workingHours') as FormArray;
                    if (workingHours) {
                        workingHours.clear();
                    }
                });
            }
        }
        if (changes['serviceCategories'] && this.serviceCategories && this.serviceCategories.length > 0 && this.daysArray) {
            (this.daysArray.controls as FormGroup[]).forEach((dayCtrl: FormGroup) => {
                const workingHours = dayCtrl.get('workingHours') as FormArray;
                if (workingHours) {
                    workingHours.controls.forEach((slotCtrl) => {
                        const currentVal = slotCtrl.get('serviceId')?.value;
                        if (currentVal) {
                            const updated = this.formatServiceValue(currentVal);
                            if (updated) {
                                slotCtrl.patchValue({ serviceId: updated }, { emitEvent: false });
                            }
                        }
                    });
                }
            });
        }
        if (changes['selectedDayOfWeek'] && this.selectedDayOfWeek != null) {
            this.activeDayIndex = Math.max(0, Number(this.selectedDayOfWeek) - 1);
        }
        if (changes['workingHoursToEdit']) {
            if (this.workingHoursToEdit && this.workingHoursToEdit.length > 0) {
                const dayIndex = Math.max(0, Number(this.selectedDayOfWeek) - 1);
                this.activeDayIndex = dayIndex;
                const dayWorkingHoursArray = this.getDayWorkingHoursArray(dayIndex);

                dayWorkingHoursArray.clear();

                this.workingHoursToEdit.forEach((wh) => {
                    const group = this.createWorkingHourFormGroup(wh.dayOfWeek);
                    group.patchValue({
                        startTime: wh.startTime,
                        endTime: wh.endTime,
                        locationId: wh.locationId,
                        serviceId: this.formatServiceValue(wh.serviceId)
                    });
                    dayWorkingHoursArray.push(group);
                });
                this.validateDaySlots(dayIndex);
            } else if (!changes['workingHoursToEdit'].firstChange && (!this.workingHoursToEdit || this.workingHoursToEdit.length === 0)) {
                this.resetForm();
            }
        }
    }

    resetForm(): void {
        this.applyToAllDays = false;
        this.activeDayIndex = 0;
        if (this.daysArray) {
            (this.daysArray.controls as FormGroup[]).forEach((dayCtrl: FormGroup) => {
                const workingHours = dayCtrl.get('workingHours') as FormArray;
                if (workingHours) {
                    workingHours.clear();
                }
                dayCtrl.reset();
            });
            this.daysArray.markAsPristine();
            this.daysArray.markAsUntouched();
        }
        if (this.workingHoursForm) {
            this.workingHoursForm.reset();
            this.workingHoursForm.markAsPristine();
            this.workingHoursForm.markAsUntouched();
        }
        this.workingHoursChanged.emit([]);
    }

    private generateDurationOptions(): void {
        this.durationOptions = [];
        const totalMinutes = 24 * 60; // 1440 minutes

        for (let i = 0; i < totalMinutes; i += 30) {
            const hours = Math.floor(i / 60);
            const minutes = i % 60;
            const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

            this.durationOptions.push({ label: formatted, value: formatted });
        }

        this.durationOptions.push({ label: '00:00', value: '00:00' });
    }

    InitialiseFormArray(): void {
        this.workingHoursForm = this.fb.group({
            days: this.fb.array(this.createDaysFormArray())
        });
    }

    createDaysFormArray(): FormGroup[] {
        return this.weekDays.map(() =>
            this.fb.group({
                workingHours: this.fb.array([])
            })
        );
    }

    get daysArray(): FormArray {
        return this.workingHoursForm.get('days') as FormArray;
    }

    getDayFormGroup(dayIndex: number): FormGroup {
        return this.daysArray.at(dayIndex) as FormGroup;
    }

    getDayWorkingHoursArray(dayIndex: number): FormArray {
        return this.getDayFormGroup(dayIndex).get('workingHours') as FormArray;
    }

    getDaySlotsCount(dayIndex: number): number {
        const day = this.weekDays[dayIndex];
        if (!day) return 0;
        const assignedCount = this.getGroupedAssignedHoursForDay(day.value).length;
        const formCount = this.getDayWorkingHoursArray(dayIndex).length;
        return formCount > 0 ? formCount : assignedCount;
    }

    private formatServiceValue(serviceId: any): any[] | null {
        if (!serviceId) return null;
        if (Array.isArray(serviceId)) {
            return serviceId;
        }
        const s = new Set<any>();
        if (typeof serviceId === 'object' && serviceId !== null) {
            if (serviceId.key) {
                s.add(serviceId.key);
            } else {
                Object.keys(serviceId).forEach(k => {
                    if (serviceId[k] === true || (serviceId[k] && serviceId[k].checked)) {
                        s.add(k);
                    }
                });
            }
        } else {
            s.add(serviceId);
        }
        return this.mapServicesToTreeValue(s);
    }

    private findTreeNodes(keys: Set<string>, nodes: any[]): any[] {
        const result: any[] = [];
        if (!nodes || nodes.length === 0) return result;

        for (const node of nodes) {
            const rawId = node.key ? node.key.toString().replace('srv-', '') : '';
            if (keys.has(node.key) || (rawId && keys.has(rawId))) {
                result.push(node);
            }
            if (node.children && node.children.length > 0) {
                result.push(...this.findTreeNodes(keys, node.children));
            }
        }
        return result;
    }

    private mapServicesToTreeValue(serviceIds: Set<any>): any[] | null {
        if (!serviceIds || serviceIds.size === 0) return null;

        const keySet = new Set<string>();
        serviceIds.forEach((sId: any) => {
            if (!sId) return;
            if (typeof sId === 'object' && sId !== null) {
                if (sId.key) {
                    keySet.add(sId.key.toString());
                } else {
                    Object.keys(sId).forEach(k => {
                        if (sId[k] === true || (sId[k] && sId[k].checked)) {
                            keySet.add(k.toString());
                        }
                    });
                }
            } else {
                const keyStr = sId.toString().startsWith('srv-') ? sId.toString() : `srv-${sId}`;
                keySet.add(keyStr);
            }
        });

        if (keySet.size === 0) return null;

        // Try to match rich tree nodes from serviceCategories
        const matched = this.findTreeNodes(keySet, this.serviceCategories || []);
        if (matched.length > 0) {
            return matched;
        }

        // Fallback: construct TreeNode array so PrimeNG display="chip" (*ngFor) receives an Array
        const fallback: any[] = [];
        keySet.forEach((key) => {
            fallback.push({
                key: key,
                label: `Service ${key.replace('srv-', '')}`
            });
        });

        return fallback;
    }

    createWorkingHourFormGroup(dayOfWeek: number): FormGroup {
        return this.fb.group(
            {
                startTime: ['', Validators.required],
                endTime: ['', Validators.required],
                locationId: [null, Validators.required],
                serviceId: [null, Validators.required],
                dayOfWeek: [dayOfWeek]
            },
            { validators: this.startBeforeEndValidator }
        );
    }

    addWorkingHour(dayIndex: number): void {
        const dayWorkingHoursArray = this.getDayWorkingHoursArray(dayIndex);
        let suggestedStart = '';
        if (dayWorkingHoursArray.length > 0) {
            const lastSlot = dayWorkingHoursArray.at(dayWorkingHoursArray.length - 1).value;
            if (lastSlot.endTime && lastSlot.endTime !== '00:00:00') {
                suggestedStart = lastSlot.endTime;
            }
        }

        const newGroup = this.createWorkingHourFormGroup(Number(this.weekDays[dayIndex].value));
        if (suggestedStart) {
            newGroup.patchValue({ startTime: suggestedStart });
        }
        dayWorkingHoursArray.push(newGroup);
        this.validateDaySlots(dayIndex);
    }

    removeWorkingHour(dayIndex: number, workingHourIndex: number): void {
        this.getDayWorkingHoursArray(dayIndex).removeAt(workingHourIndex);
        this.validateDaySlots(dayIndex);
    }

    clearDay(dayIndex: number): void {
        const dayWorkingHoursArray = this.getDayWorkingHoursArray(dayIndex);
        dayWorkingHoursArray.clear();
        this.validateDaySlots(dayIndex);
    }

    getWorkingHourFormGroup(dayIndex: number, workingHourIndex: number): FormGroup {
        return this.getDayWorkingHoursArray(dayIndex).at(workingHourIndex) as FormGroup;
    }

    startBeforeEndValidator(group: AbstractControl): ValidationErrors | null {
        const start = group.get('startTime')?.value;
        const end = group.get('endTime')?.value;
        if (!start || !end) return null;
        return start >= end ? { startAfterEnd: true } : null;
    }

    validateDaySlots(dayIndex: number): void {
        const slotsArray = this.getDayWorkingHoursArray(dayIndex);
        const slotsCount = slotsArray.length;

        // Reset previous conflict errors while keeping any other existing errors
        for (let i = 0; i < slotsCount; i++) {
            const group = slotsArray.at(i) as FormGroup;
            if (group.errors) {
                const currentErrors = { ...group.errors };
                delete currentErrors['duplicateTimes'];
                delete currentErrors['overlappingTimes'];
                const remainingKeys = Object.keys(currentErrors);
                group.setErrors(remainingKeys.length > 0 ? currentErrors : null);
            }
        }

        // Compare all pairs of slots in this day
        for (let i = 0; i < slotsCount; i++) {
            const groupA = slotsArray.at(i) as FormGroup;
            const startA = groupA.get('startTime')?.value;
            const endA = groupA.get('endTime')?.value;

            if (!startA || !endA || startA >= endA) continue;

            for (let j = 0; j < slotsCount; j++) {
                if (i === j) continue;
                const groupB = slotsArray.at(j) as FormGroup;
                const startB = groupB.get('startTime')?.value;
                const endB = groupB.get('endTime')?.value;

                if (!startB || !endB || startB >= endB) continue;

                // 1. Exact duplicate: exact same start and end times
                if (startA === startB && endA === endB) {
                    const errorsA = groupA.errors ? { ...groupA.errors } : {};
                    errorsA['duplicateTimes'] = true;
                    groupA.setErrors(errorsA);

                    const errorsB = groupB.errors ? { ...groupB.errors } : {};
                    errorsB['duplicateTimes'] = true;
                    groupB.setErrors(errorsB);
                }
                // 2. Overlapping times: intervals overlap
                else if (startA < endB && endA > startB) {
                    const errorsB = groupB.errors ? { ...groupB.errors } : {};
                    errorsB['overlappingTimes'] = true;
                    groupB.setErrors(errorsB);
                }
            }
        }
    }

    hasTimeConflicts(dayIndex: number): boolean {
        const slotsArray = this.getDayWorkingHoursArray(dayIndex);
        for (let i = 0; i < slotsArray.length; i++) {
            const errors = slotsArray.at(i).errors;
            if (errors?.['duplicateTimes'] || errors?.['overlappingTimes'] || errors?.['startAfterEnd']) {
                return true;
            }
        }
        return false;
    }

    onSaveClicked(dayIndex: number): void {
        this.validateDaySlots(dayIndex);
        if (this.hasTimeConflicts(dayIndex)) {
            this.messageService.add({
                severity: 'error',
                summary: 'Time Conflict',
                detail: 'Cannot save: Slots on this day have duplicate or overlapping start and end times.'
            });
            return;
        }
        this.saveClicked.emit();
    }

    onTimeChanged(dayIndex: number, workingHourIndex: number, isStartChange: boolean = false): void {
        const group = this.getWorkingHourFormGroup(dayIndex, workingHourIndex);
        const wh = group.value;

        // If the user changed the start time, we need to ensure the end time is still valid
        if (isStartChange && wh.startTime && wh.endTime) {
            if (wh.endTime <= wh.startTime) {
                // The current end time is no longer valid, so we clear it out to force them to pick a new one
                group.patchValue({ endTime: null }, { emitEvent: false });
                wh.endTime = null;
            }
        }

        this.validateDaySlots(dayIndex);

        if (!this.applyToAllDays) return;

        if (wh.startTime && wh.endTime) {
            this.copyWorkingHoursToAllDays(wh.startTime, wh.endTime, wh.locationId, wh.serviceId);
        }
    }

    onFieldChanged(dayIndex: number, workingHourIndex: number): void {
        const group = this.getWorkingHourFormGroup(dayIndex, workingHourIndex);
        const wh = group.value;

        if (this.applyToAllDays && wh.startTime && wh.endTime) {
            this.copyWorkingHoursToAllDays(wh.startTime, wh.endTime, wh.locationId, wh.serviceId);
        }
    }

    onApplyToAllChange(): void {
        if (this.applyToAllDays) {
            // Find the first day with a valid start and end time
            let found = false;
            for (let i = 0; i < this.daysArray.length; i++) {
                const dayGroup = this.getDayFormGroup(i);
                const workingHours = dayGroup.get('workingHours') as FormArray;

                for (let j = 0; j < workingHours.length; j++) {
                    const wh = workingHours.at(j).value;
                    if (wh.startTime && wh.endTime) {
                        this.copyWorkingHoursToAllDays(wh.startTime, wh.endTime, wh.locationId, wh.serviceId);
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }

            if (!found) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Please select start and end time for at least one day before applying to all.'
                });
                // Uncheck the box using setTimeout to avoid change detection errors
                setTimeout(() => {
                    this.applyToAllDays = false;
                });
            }
        } else {
            // If unchecked, reset all working hours back to empty arrays across all days
            (this.daysArray.controls as FormGroup[]).forEach((dayCtrl: FormGroup) => {
                const workingHours = dayCtrl.get('workingHours') as FormArray;
                workingHours.clear();
            });

            // Emit the reset data
            const updatedData = this.buildPayload();
            this.workingHoursChanged.emit(updatedData);
        }
    }

    copyWorkingHoursToAllDays(start: string, end: string, locationId: any, serviceId: any): void {
        (this.daysArray.controls as FormGroup[]).forEach((dayCtrl: FormGroup) => {
            const workingHours = dayCtrl.get('workingHours') as FormArray;

            // If a day has no working hour, add one first
            if (workingHours.length === 0) {
                workingHours.push(this.createWorkingHourFormGroup(1));
            }

            workingHours.controls.forEach((whCtrl) => {
                whCtrl.patchValue({ startTime: start, endTime: end, locationId: locationId, serviceId: serviceId }, { emitEvent: false });
            });
        });

        for (let i = 0; i < this.daysArray.length; i++) {
            this.validateDaySlots(i);
        }

        const updatedData = this.buildPayload();
        this.workingHoursChanged.emit(updatedData);
    }

    getEndTimeOptions(startTime: string | null | undefined): { label: string; value: string }[] {
        if (!startTime) return this.durationOptions;
        return this.durationOptions.filter(opt => opt.value > startTime);
    }

    private buildPayload(): any[] {
        const payload: any[] = [];
        this.workingHoursForm.value.days.forEach((day: any, index: number) => {
            day.workingHours.forEach((wh: any) => {
                payload.push({
                    dayOfWeek: index + 1,
                    startTime: wh.startTime,
                    endTime: wh.endTime,
                    locationId: wh.locationId,
                    serviceId: wh.serviceId
                });
            });
        });
        return payload;
    }

    getAssignedHoursForDay(dayValue: string): any[] {
        if (!this.assignedWorkingHours || this.assignedWorkingHours.length === 0) return [];
        return this.assignedWorkingHours.filter(wh => wh.dayOfWeek.toString() === dayValue);
    }

    getGroupedAssignedHoursForDay(dayValue: string): any[] {
        if (!this.assignedWorkingHours || this.assignedWorkingHours.length === 0) return [];
        const dayHours = this.assignedWorkingHours.filter(wh => wh.dayOfWeek.toString() === dayValue);

        const grouped = new Map<string, any>();

        dayHours.forEach(wh => {
            const key = `${wh.startTime}-${wh.endTime}`;
            if (!grouped.has(key)) {
                grouped.set(key, {
                    id: key,
                    dayLabel: wh.dayLabel,
                    startTime: wh.startTime,
                    endTime: wh.endTime,
                    services: wh.serviceNameEn ? [wh.serviceNameEn] : [],
                    locations: wh.locationNameEn ? [wh.locationNameEn] : []
                });
            } else {
                const existing = grouped.get(key);
                if (wh.serviceNameEn && !existing.services.includes(wh.serviceNameEn)) {
                    existing.services.push(wh.serviceNameEn);
                }
                if (wh.locationNameEn && !existing.locations.includes(wh.locationNameEn)) {
                    existing.locations.push(wh.locationNameEn);
                }
            }
        });

        return Array.from(grouped.values()).sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
}
