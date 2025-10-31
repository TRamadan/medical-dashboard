import { Component, effect, EventEmitter, Input, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AssignedServicesStateService } from '../../add-user/services/assigned-services-state.service';
import { AccordionModule } from 'primeng/accordion';
import { SelectModule } from 'primeng/select';
import { Button } from 'primeng/button';
@Component({
    selector: 'app-assing-hours',
    standalone: true,
    templateUrl: './assing-hours.component.html',
    styleUrls: ['./assing-hours.component.css'],
    imports: [AccordionModule, FormsModule, ReactiveFormsModule, SelectModule, Button]
})
export class AssingHoursComponent implements OnInit {
    workingHoursForm!: FormGroup;
    @Input() selectedDayOfWeek!: number;
    @Input() workingHoursToEdit: any[] = [];
    @Output() workingHoursChanged = new EventEmitter<any[]>();
    durationOptions: { label: string; value: string }[] = [];

    allLocations: any[] = [
        { id: 1, name: 'Main Branch' },
        { id: 2, name: 'Downtown Clinic' },
        { id: 3, name: 'Uptown Center' }
    ];
    selectedLocation: number | null = null;

    // allServices is now a signal for reactivity
    allServices = signal<any[]>([]);
    selectedService: number | null = null;

    weekDays: any[] = [
        { label: 'Monday', value: '1', times: [] },
        { label: 'Tuesday', value: '2', times: [] },
        { label: 'Wednesday', value: '3', times: [] },
        { label: 'Thursday', value: '4', times: [] },
        { label: 'Friday', value: '5', times: [] },
        { label: 'Saturday', value: '6', times: [] },
        { label: 'Sunday', value: '7', times: [] }
    ];

    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
        this.InitialiseFormArray();
        this.generateDurationOptions();
        this.workingHoursForm.valueChanges.subscribe(() => {
            const currentData = this.buildPayload();
            this.workingHoursChanged.emit(currentData);
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['workingHoursToEdit'] && this.workingHoursToEdit.length > 0) {
            const dayIndex = this.selectedDayOfWeek - 1;
            const dayWorkingHoursArray = this.getDayWorkingHoursArray(dayIndex);

            dayWorkingHoursArray.clear();

            this.workingHoursToEdit.forEach((wh) => {
                const group = this.createWorkingHourFormGroup(wh.dayOfWeek);
                group.patchValue({
                    startTime: wh.startTime,
                    endTime: wh.endTime
                });

                dayWorkingHoursArray.push(group);
            });
        }
    }

    private generateDurationOptions(): void {
        this.durationOptions = [];
        const totalMinutes = 24 * 60; // 1440 minutes

        for (let i = 0; i < totalMinutes; i += 30) {
            const hours = Math.floor(i / 60);
            const minutes = i % 60;

            const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

            this.durationOptions.push({
                label: formatted,
                value: formatted
            });
        }

        // Optional: include 00:00 again at the end (like your provided array)
        this.durationOptions.push({ label: '00:00', value: '00:00' });
    }

    workingHourGroup(): FormGroup {
        return this.fb.group(
            {
                startTime: ['', Validators.required],
                endTime: ['', Validators.required]
            },
            { validators: this.startBeforeEndValidator }
        );
    }

    startBeforeEndValidator(group: AbstractControl): ValidationErrors | null {
        const start = group.get('startTime')?.value;
        const end = group.get('endTime')?.value;

        if (!start || !end) return null;

        // Compare (assuming time is in "HH:mm" format)
        if (start >= end) {
            return { startAfterEnd: true };
        }

        return null;
    }

    // Updated form initialization with days structure
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

    createWorkingHourFormGroup(dayOfWeek: number): FormGroup {
        return this.fb.group(
            {
                startTime: ['', Validators.required],
                endTime: ['', Validators.required],
                dayOfWeek: [dayOfWeek]
            },
            { validators: this.startBeforeEndValidator }
        );
    }

    // Updated to add working hour for specific day
    addWorkingHour(dayIndex: number) {
        const day = this.weekDays[dayIndex];
        const dayWorkingHoursArray = this.getDayWorkingHoursArray(dayIndex);

        dayWorkingHoursArray.push(this.createWorkingHourFormGroup(Number(day.value)));
    }

    removeWorkingHour(dayIndex: number, workingHourIndex: number) {
        const dayWorkingHoursArray = this.getDayWorkingHoursArray(dayIndex);
        dayWorkingHoursArray.removeAt(workingHourIndex);
    }

    getWorkingHourFormGroup(dayIndex: number, workingHourIndex: number): FormGroup {
        const dayWorkingHoursArray = this.getDayWorkingHoursArray(dayIndex);
        return dayWorkingHoursArray.at(workingHourIndex) as FormGroup;
    }

    markFormGroupTouched(): void {
        Object.keys(this.workingHoursForm.controls).forEach((key) => {
            const control = this.workingHoursForm.get(key);
            if (control instanceof FormGroup) {
                this.markFormGroupTouched();
            } else {
                control?.markAsTouched();
            }
        });
    }

    workingHours = signal<any[]>(
        this.weekDays.map((day) => ({
            day,
            startTime: '15:00',
            endTime: '00:00',
            isAvailable: true,
            locationId: null,
            serviceIds: []
        }))
    );

    getWorkingHour(index: number): any {
        return this.workingHours()[index];
    }

    onAvailabilityChange(index: number, event: Event) {
        const target = event.target as HTMLInputElement;
        const currentHours = this.workingHours();
        const updatedHours = [...currentHours];
        updatedHours[index] = { ...updatedHours[index], isAvailable: target.checked };
        this.workingHours.set(updatedHours);
    }

    private buildPayload(): any[] {
        const payload: any[] = [];
        this.workingHoursForm.value.days.forEach((day: any, index: number) => {
            day.workingHours.forEach((wh: any) => {
                payload.push({
                    dayOfWeek: index + 1,
                    startTime: wh.startTime,
                    endTime: wh.endTime
                });
            });
        });
        return payload;
    }
}
