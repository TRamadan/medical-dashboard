import { Component, EventEmitter, Input, OnChanges, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AudienceSelectorComponent } from '../audience-selector/audience-selector.component';
import { RecurrencePickerComponent } from '../recurrence-picker/recurrence-picker.component';
import { NotificationTriggerService } from '../../services/notification-trigger.service';

import {
  AudienceUser,
  NotificationTrigger,
  RecurrenceRule,
  UserType,
  defaultRecurrenceRule,
} from '../../models/notification-trigger.model';
import { computeNextOccurrences, describeRecurrence } from '../../models/recurrence.util';

export interface NotificationTypeOption {
  label: string;
  value: string;
}

export interface TriggerFormValue {
  title: string;
  message: string;
  notificationType: string;
  recurrence: RecurrenceRule;
  userTypeIds: string[];
  userIds: string[];
  active: boolean;
}

@Component({
  selector: 'app-trigger-form',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    InputTextarea,
    InputSwitchModule,
    RadioButtonModule,
    ButtonModule,
    CardModule,
    AudienceSelectorComponent,
    RecurrencePickerComponent,
  ],
  templateUrl: './trigger-form.component.html',
  styleUrl: './trigger-form.component.scss',
})
export class TriggerFormComponent implements OnChanges {
  @Input() trigger: NotificationTrigger | null = null;
  @Output() save = new EventEmitter<TriggerFormValue>();
  @Output() cancel = new EventEmitter<void>();

  readonly userTypes: UserType[];
  readonly users: AudienceUser[];

  readonly notificationTypes: NotificationTypeOption[] = [
    { label: 'حجز جلسة', value: 'session_booking' },
    { label: 'تأكيد جلسة', value: 'session_confirmation' },
    { label: 'الغاء او اعادة جدولة الجلسة', value: 'session_reschedule_cancel' },
    { label: 'الانتقال لمرحلة جديدة في البرنامج', value: 'stage_transition' },
    { label: 'نتائج قياسات', value: 'measurement_results' },
    { label: 'نزول تقرير', value: 'report_released' },
    { label: 'تأخير عن بداية الجلسة', value: 'session_delay' },
    { label: 'انتهاء البرنامج', value: 'program_completion' },
    { label: 'اعياد الميلاد', value: 'birthday' },
  ];

  readonly title = signal('');
  readonly message = signal('');
  readonly notificationType = signal('');
  readonly recurrence = signal<RecurrenceRule>(defaultRecurrenceRule());
  readonly selectedUserTypeIds = signal<string[]>([]);
  readonly selectedUserIds = signal<string[]>([]);
  readonly active = signal(true);

  readonly recurrenceSummary = computed(() => describeRecurrence(this.recurrence()));
  readonly nextOccurrences = computed(() => computeNextOccurrences(this.recurrence(), 4));

  readonly canSave = computed(
    () =>
      this.title().trim().length > 0 &&
      this.message().trim().length > 0 &&
      this.notificationType().length > 0 &&
      (this.selectedUserTypeIds().length > 0 || this.selectedUserIds().length > 0)
  );

  constructor(private readonly service: NotificationTriggerService) {
    this.userTypes = service.userTypes();
    this.users = service.users();
  }

  ngOnChanges(): void {
    if (this.trigger) {
      this.title.set(this.trigger.title);
      this.message.set(this.trigger.message);
      this.notificationType.set(this.trigger.notificationType ?? '');
      this.recurrence.set(this.trigger.recurrence);
      this.selectedUserTypeIds.set(this.trigger.userTypeIds ?? []);
      this.selectedUserIds.set(this.trigger.userIds ?? []);
      this.active.set(this.trigger.active);
    } else {
      this.title.set('');
      this.message.set('');
      this.notificationType.set('');
      this.recurrence.set(defaultRecurrenceRule());
      this.selectedUserTypeIds.set([]);
      this.selectedUserIds.set([]);
      this.active.set(true);
    }
  }

  onSubmit(): void {
    if (!this.canSave()) return;
    this.save.emit({
      title: this.title().trim(),
      message: this.message().trim(),
      notificationType: this.notificationType(),
      recurrence: this.recurrence(),
      userTypeIds: this.selectedUserTypeIds(),
      userIds: this.selectedUserIds(),
      active: this.active(),
    });
  }

  formatOccurrence(d: Date): string {
    return d.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
}