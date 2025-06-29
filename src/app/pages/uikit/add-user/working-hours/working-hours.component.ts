// Updated TypeScript Component
import { Component, OnInit, signal, effect } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { FormsModule, ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { AssignedServicesStateService } from '../services/assigned-services-state.service';

interface WorkingHour {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  locationId: number | null;
  serviceIds: number[];
}

interface TimeOption {
  label: string;
  value: string;
}

interface LocationOption {
  id: number;
  name: string;
}

interface ServiceOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-working-hours',
  imports: [SelectModule, MultiSelectModule, AccordionModule, FormsModule, ReactiveFormsModule, ButtonModule],
  standalone: true,
  templateUrl: './working-hours.component.html',
  styleUrl: './working-hours.component.css'
})
export class WorkingHoursComponent implements OnInit {
  workingHoursForm!: FormGroup;

  allLocations: LocationOption[] = [
    { id: 1, name: 'Main Branch' },
    { id: 2, name: 'Downtown Clinic' },
    { id: 3, name: 'Uptown Center' }
  ];
  selectedLocation: number | null = null;

  // allServices is now a signal for reactivity
  allServices = signal<ServiceOption[]>([]);
  selectedService: number | null = null;

  daysOfWeek = [
    'Saturday',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ];

  timeOptions: TimeOption[] = [
    { label: '15:00', value: '15:00' },
    { label: '15:30', value: '15:30' },
    { label: '16:00', value: '16:00' },
    { label: '16:30', value: '16:30' },
    { label: '17:00', value: '17:00' },
    { label: '17:30', value: '17:30' },
    { label: '18:00', value: '18:00' },
    { label: '18:30', value: '18:30' },
    { label: '19:00', value: '19:00' },
    { label: '19:30', value: '19:30' },
    { label: '20:00', value: '20:00' },
    { label: '20:30', value: '20:30' },
    { label: '21:00', value: '21:00' },
    { label: '21:30', value: '21:30' },
    { label: '22:00', value: '22:00' },
    { label: '22:30', value: '22:30' },
    { label: '23:00', value: '23:00' },
    { label: '23:30', value: '23:30' },
    { label: '00:00', value: '00:00' }
  ];

  constructor(
    private assignedServicesState: AssignedServicesStateService,
    private fb: FormBuilder
  ) {
    effect(() => {
      const services = this.assignedServicesState.selectedServices();
      this.allServices.set(services.map(s => ({ id: s.id, name: s.name })));
    });
  }

  ngOnInit(): void {
    this.getAllAddedLocations();
    this.InitialiseFormArray();
  }

  // Updated form initialization with days structure
  InitialiseFormArray(): void {
    this.workingHoursForm = this.fb.group({
      days: this.fb.array(this.createDaysFormArray())
    });
  }

  createDaysFormArray(): FormGroup[] {
    return this.daysOfWeek.map(() => this.fb.group({
      workingHours: this.fb.array([])
    }));
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

  createWorkingHourFormGroup(): FormGroup {
    return this.fb.group({
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      locationId: ['', Validators.required],
      serviceId: ['', Validators.required]
    });
  }

  // Updated to add working hour for specific day
  addWorkingHour(dayIndex: number) {
    const dayWorkingHoursArray = this.getDayWorkingHoursArray(dayIndex);
    dayWorkingHoursArray.push(this.createWorkingHourFormGroup());
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
    Object.keys(this.workingHoursForm.controls).forEach(key => {
      const control = this.workingHoursForm.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched();
      } else {
        control?.markAsTouched();
      }
    });
  }

  workingHours = signal<WorkingHour[]>(
    this.daysOfWeek.map(day => ({
      day,
      startTime: '15:00',
      endTime: '00:00',
      isAvailable: true,
      locationId: null,
      serviceIds: []
    }))
  );

  getWorkingHour(index: number): WorkingHour {
    return this.workingHours()[index];
  }

  onAvailabilityChange(index: number, event: Event) {
    const target = event.target as HTMLInputElement;
    const currentHours = this.workingHours();
    const updatedHours = [...currentHours];
    updatedHours[index] = { ...updatedHours[index], isAvailable: target.checked };
    this.workingHours.set(updatedHours);
  }

  getAllAddedLocations(): void {
    // Implementation needed
  }

  getAllServicesBasedOnServicesChoice(): void {
    // Implementation needed
  }

  onSubmit() {
    if (this.workingHoursForm.valid) {
      console.log('Form Value:', this.workingHoursForm.value);
    } else {
      console.log('Form is invalid');
      this.workingHoursForm.markAllAsTouched();
    }
  }
}