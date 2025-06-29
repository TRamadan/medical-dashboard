import { Component, OnInit, signal, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { DatePipe } from '@angular/common';
import { DatePickerModule } from "primeng/datepicker";

interface DayOff {
  dateRange: [Date | null, Date | null];
  dayName: string;
  isYearly: boolean;
}

@Component({
  selector: 'app-days-off',
  imports: [
    CalendarModule,
    DatePickerModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    ToggleButtonModule,
    CardModule,
    DividerModule,
    DatePipe
  ],
  standalone: true,
  templateUrl: './days-off.component.html',
  styleUrl: './days-off.component.scss'
})
export class DaysOffComponent implements OnInit, AfterViewInit {
  daysOffForm: FormGroup;
  selectedYear: Date = new Date();
  isFormReady = false;

  // Information about day types
  yearlyDayColor = '#10B981'; // Green
  onceOffDayColor = '#F59E0B'; // Amber

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize with current year
    const currentYear = new Date();
    currentYear.setMonth(0, 1); // Set to January 1st of current year

    this.daysOffForm = this.fb.group({
      year: [currentYear, Validators.required],
      daysOff: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Add initial day off entry
    this.addDayOff();
  }

  ngAfterViewInit(): void {
    // Ensure form is ready after view initialization
    setTimeout(() => {
      this.isFormReady = true;
      this.cdr.detectChanges();
    }, 100);
  }

  get daysOffArray(): FormArray {
    return this.daysOffForm.get('daysOff') as FormArray;
  }

  createDayOffFormGroup(): FormGroup {
    return this.fb.group({
      dateRange: [null, Validators.required], // Initialize as null instead of [null, null]
      dayName: ['', Validators.required],
      isYearly: [false]
    });
  }

  addDayOff(): void {
    this.daysOffArray.push(this.createDayOffFormGroup());
  }

  removeDayOff(index: number): void {
    if (this.daysOffArray.length > 1) {
      this.daysOffArray.removeAt(index);
    }
  }

  getDayOffFormGroup(index: number): FormGroup {
    return this.daysOffArray.at(index) as FormGroup;
  }

  onYearChange(event: any): void {
    if (event && event instanceof Date) {
      this.selectedYear = event;
    }
  }

  onSubmit(): void {
    if (this.daysOffForm.valid) {
      // Handle form submission here
    } else {
      this.daysOffForm.markAllAsTouched();
    }
  }

  getDayTypeColor(isYearly: boolean): string {
    return isYearly ? this.yearlyDayColor : this.onceOffDayColor;
  }

  getDayTypeText(isYearly: boolean): string {
    return isYearly ? 'Repeats Yearly' : 'Once Off';
  }

  getDayTypeIcon(isYearly: boolean): string {
    return isYearly ? 'pi pi-refresh' : 'pi pi-calendar-times';
  }

  // Helper method to safely get date range values
  getDateRangeValue(dayOffIndex: number): any {
    const formGroup = this.getDayOffFormGroup(dayOffIndex);
    const dateRange = formGroup.get('dateRange')?.value;
    return dateRange || null;
  }

  // Helper method to check if date range has valid dates
  hasValidDateRange(dayOffIndex: number): boolean {
    const dateRange = this.getDateRangeValue(dayOffIndex);
    return dateRange && Array.isArray(dateRange) && dateRange.length === 2 &&
      dateRange[0] instanceof Date && dateRange[1] instanceof Date;
  }
}
