import { Component, OnInit, signal } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';

interface WorkingHour {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  locationId: number | null;
  serviceId: number | null;
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
  imports: [SelectModule, MultiSelectModule, AccordionModule, FormsModule],
  standalone: true,
  templateUrl: './working-hours.component.html',
  styleUrl: './working-hours.component.css'
})
export class WorkingHoursComponent implements OnInit {
  allLocations: LocationOption[] = [
    { id: 1, name: 'Main Branch' },
    { id: 2, name: 'Downtown Clinic' },
    { id: 3, name: 'Uptown Center' }
  ];
  selectedLocation: number | null = null;

  allServices: ServiceOption[] = [
    { id: 1, name: 'Physiotherapy' },
    { id: 2, name: 'Nutrition' },
    { id: 3, name: 'Personal Training' }
  ];
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

  ngOnInit(): void {
    this.getAllAddedLocations();
  }

  workingHours = signal<WorkingHour[]>(
    this.daysOfWeek.map(day => ({
      day,
      startTime: '15:00',
      endTime: '00:00',
      isAvailable: true,
      locationId: null,
      serviceId: null
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

  //here is the function needed to fetch all added locations
  getAllAddedLocations(): void {
    // Implementation needed
  }

  //here is the function needed to show the choosed service based onn the previous step (Assigned services)
  getAllServicesBasedOnServicesChoice(): void {
    // Implementation needed
  }
}
