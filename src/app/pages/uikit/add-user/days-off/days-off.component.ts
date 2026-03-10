import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { DatePipe } from '@angular/common';
import { DatePickerModule } from "primeng/datepicker";
import { MessageService } from 'primeng/api';
import { DaysOffService } from './services/days-off.service';

interface DayOff {
  id?: number;
  doctorId: number;
  fromDate: string | Date;
  toDate: string | Date;
  reason: string;
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
  providers: [DatePipe],
  templateUrl: './days-off.component.html',
  styleUrl: './days-off.component.scss'
})
export class DaysOffComponent implements OnInit {
  @Input() doctorId!: number;
  @Input() dayOff: any = null;
  @Output() saved = new EventEmitter<void>();

  daysOffForm: FormGroup;
  isSubmitting = false;
  isDeleting = false;
  minDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private daysOffService: DaysOffService,
    private messageService: MessageService,
    private datePipe: DatePipe
  ) {
    this.daysOffForm = this.fb.group({
      dateRange: [null, Validators.required],
      reason: ['', Validators.required],
      isCancelled: [false]
    });
  }

  ngOnInit(): void {
    if (this.dayOff) {
      const fromDate = new Date(this.dayOff.fromDate);
      const toDate = new Date(this.dayOff.toDate);
      this.daysOffForm.patchValue({
        dateRange: [fromDate, toDate],
        reason: this.dayOff.reason,
        isCancelled: this.dayOff.isCancelled || false
      });
    }
  }

  onSubmit(): void {
    if (this.daysOffForm.invalid) {
      this.daysOffForm.markAllAsTouched();
      return;
    }

    const formValue = this.daysOffForm.value;
    const dateRange = formValue.dateRange;

    let fromDateStr = '';
    let toDateStr = '';

    if (dateRange && dateRange[0]) {
      fromDateStr = this.datePipe.transform(dateRange[0], 'yyyy-MM-dd') || '';
      toDateStr = dateRange[1] ? (this.datePipe.transform(dateRange[1], 'yyyy-MM-dd') || '') : fromDateStr;
    }

    const payload = {
      doctorId: this.doctorId,
      fromDate: fromDateStr,
      toDate: toDateStr,
      reason: formValue.reason,
      isCancelled: formValue.isCancelled || false
    };

    this.isSubmitting = true;

    if (this.dayOff && this.dayOff.id) {
      const updatePayload = {
        ...payload,
        id: this.dayOff.id
      };
      this.daysOffService.updateDaysOff(updatePayload).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Day off updated successfully' });
          this.daysOffForm.reset();
          this.isSubmitting = false;
          this.saved.emit();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update day off' });
          this.isSubmitting = false;
        }
      });
    } else {
      this.daysOffService.addDaysOff(payload as any).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Day off added successfully' });
          this.daysOffForm.reset();
          this.isSubmitting = false;
          this.saved.emit();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add day off' });
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteDayOff(): void {
    if (!this.dayOff?.id) return;
    this.isDeleting = true;
    this.daysOffService.deleteDaysOff(this.dayOff.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Day off deleted successfully' });
        this.isDeleting = false;
        this.saved.emit();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete day off' });
        this.isDeleting = false;
      }
    });
  }
}
