import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { Button } from 'primeng/button';

@Component({
    selector: 'app-assing-hours',
    standalone: true,
    templateUrl: './assing-hours.component.html',
    styleUrls: ['./assing-hours.component.css'],
    imports: [AccordionModule, FormsModule, ReactiveFormsModule, SelectModule, Button, CheckboxModule]
})
export class AssingHoursComponent implements OnInit {
    workingHoursForm!: FormGroup;
    @Input() selectedDayOfWeek!: number;
    @Input() workingHoursToEdit: any[] = [];
    @Output() workingHoursChanged = new EventEmitter<any[]>();

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

    addWorkingHour(dayIndex: number) {
        const dayWorkingHoursArray = this.getDayWorkingHoursArray(dayIndex);
        dayWorkingHoursArray.push(this.createWorkingHourFormGroup(Number(this.weekDays[dayIndex].value)));
    }

    removeWorkingHour(dayIndex: number, workingHourIndex: number) {
        this.getDayWorkingHoursArray(dayIndex).removeAt(workingHourIndex);
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

    onTimeChanged(dayIndex: number, workingHourIndex: number): void {
        if (!this.applyToAllDays) return;
        const wh = this.getWorkingHourFormGroup(dayIndex, workingHourIndex).value;
        if (wh.startTime && wh.endTime) {
            this.copyWorkingHoursToAllDays(wh.startTime, wh.endTime);
        }
    }

    copyWorkingHoursToAllDays(start: string, end: string): void {
        (this.daysArray.controls as FormGroup[]).forEach((dayCtrl: FormGroup) => {
            const workingHours = dayCtrl.get('workingHours') as FormArray;

            // If a day has no working hour, add one first
            if (workingHours.length === 0) {
                workingHours.push(this.createWorkingHourFormGroup(1));
            }

            workingHours.controls.forEach((whCtrl) => {
                whCtrl.patchValue({ startTime: start, endTime: end }, { emitEvent: false });
            });
        });

        const updatedData = this.buildPayload();
        this.workingHoursChanged.emit(updatedData);
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
