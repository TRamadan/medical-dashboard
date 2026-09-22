import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';
import { AudienceSelectorComponent } from '../audience-selector/audience-selector.component';
import { RecurrencePickerComponent } from '../recurrence-picker/recurrence-picker.component';
import {
  AudienceOption,
  AudienceUserItem,
  NotificationTriggerDetail,
  NotificationTriggerPayload,
  NotificationTriggerTypeOption,
  RecurrenceRule,
  defaultRecurrenceRule,
} from '../../models/notification-trigger.model';
import { computeNextOccurrences, describeRecurrence } from '../../models/recurrence.util';

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
    DropdownModule,
    MessageModule,
    AudienceSelectorComponent,
    RecurrencePickerComponent,
  ],
  templateUrl: './trigger-form.component.html',
  styleUrl: './trigger-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriggerFormComponent implements OnChanges {
  readonly trigger = input<NotificationTriggerDetail | null>(null);
  readonly triggerTypes = input<NotificationTriggerTypeOption[]>([]);
  readonly audienceOptions = input<AudienceOption[]>([]);
  readonly audienceUsers = input<AudienceUserItem[]>([]);
  readonly serverError = input<string | null>(null);
  readonly saving = input<boolean>(false);

  readonly save = output<NotificationTriggerPayload>();
  readonly cancel = output<void>();

  readonly title = signal('');
  readonly message = signal('');
  readonly type = signal<number | null>(null);
  readonly recurrence = signal<RecurrenceRule>(defaultRecurrenceRule());
  readonly audienceEmployeeTypeIds = signal<number[]>([]);
  readonly includePatients = signal(false);
  readonly selectedUserIds = signal<number[]>([]);
  readonly active = signal(true);

  readonly recurrenceSummary = computed(() => describeRecurrence(this.recurrence()));
  readonly nextOccurrences = computed(() => computeNextOccurrences(this.recurrence(), 4));

  readonly isAudienceValid = computed(
    () =>
      this.audienceEmployeeTypeIds().length > 0 ||
      this.includePatients() ||
      this.selectedUserIds().length > 0
  );

  readonly canSave = computed(
    () =>
      this.title().trim().length > 0 &&
      this.message().trim().length > 0 &&
      this.type() != null &&
      this.isAudienceValid()
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trigger']) {
      const t = this.trigger();
      if (t) {
        this.title.set(t.title || '');
        this.message.set(t.message || '');
        this.type.set(t.type != null ? Number(t.type) : null);
        this.recurrence.set({
          frequency: (t.frequency as any) ?? 2,
          interval: t.interval ?? 1,
          daysOfWeek: t.daysOfWeek ?? [],
          dayOfMonth: t.dayOfMonth ?? null,
          time: t.timeOfDay || '08:00:00',
          startDate: t.startDate || new Date().toISOString().slice(0, 10),
          endMode: (t.endType as any) ?? 1,
          endDate: t.endDate ?? null,
          occurrenceCount: t.maxOccurrences ?? null,
        });
        this.audienceEmployeeTypeIds.set(t.audienceEmployeeTypeIds ?? []);
        this.includePatients.set(!!t.includePatients);
        this.selectedUserIds.set(t.recipientUserIds ?? []);
        this.active.set(t.isActive ?? true);
      } else {
        this.resetForm();
      }
    }
  }

  private resetForm(): void {
    this.title.set('');
    this.message.set('');
    this.type.set(null);
    this.recurrence.set(defaultRecurrenceRule());
    this.audienceEmployeeTypeIds.set([]);
    this.includePatients.set(false);
    this.selectedUserIds.set([]);
    this.active.set(true);
  }

  onSubmit(): void {
    debugger
    // if (!this.canSave()) return;

    const r = this.recurrence();
    const payload: NotificationTriggerPayload = {
      title: this.title().trim(),
      message: this.message().trim(),
      type: Number(this.type()),
      frequency: Number(r.frequency),
      interval: Math.max(1, Number(r.interval) || 1),
      daysOfWeek: r.frequency === 2 ? r.daysOfWeek : null,
      dayOfMonth: r.frequency === 3 ? (r.dayOfMonth ?? 1) : null,
      timeOfDay: this.formatTimeOfDay(r.time),
      startDate: r.startDate,
      endType: Number(r.endMode),
      endDate: r.endMode === 2 ? r.endDate : null,
      maxOccurrences: r.endMode === 3 ? (r.occurrenceCount ?? 1) : null,
      audienceEmployeeTypeIds: this.audienceEmployeeTypeIds(),
      includePatients: this.includePatients(),
      recipientUserIds: this.selectedUserIds(),
      isActive: this.active(),
    };

    this.save.emit(payload);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private formatTimeOfDay(t: string): string {
    if (!t) return '08:00:00';
    const parts = t.split(':');
    if (parts.length === 2) return `${t}:00`;
    return t;
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