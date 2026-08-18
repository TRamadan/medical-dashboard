import { Component, EventEmitter, Input, OnChanges, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AudienceSelectorComponent } from '../audience-selector/audience-selector.component';
import { RecurrencePickerComponent } from '../recurrence-picker/recurrence-picker.component';
import { NotificationTriggerService } from '../../services/notification-trigger.service';
import {
  AudienceSegment,
  NotificationTrigger,
  RecurrenceRule,
  defaultRecurrenceRule,
} from '../../models/notification-trigger.model';
import { computeNextOccurrences, describeRecurrence } from '../../models/recurrence.util';

export interface TriggerFormValue {
  title: string;
  message: string;
  recurrence: RecurrenceRule;
  audienceSegmentIds: string[];
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

  readonly segments: AudienceSegment[];

  readonly title = signal('');
  readonly message = signal('');
  readonly recurrence = signal<RecurrenceRule>(defaultRecurrenceRule());
  readonly audienceSegmentIds = signal<string[]>([]);
  readonly active = signal(true);

  readonly recurrenceSummary = computed(() => describeRecurrence(this.recurrence()));
  readonly nextOccurrences = computed(() => computeNextOccurrences(this.recurrence(), 4));
  readonly estimatedReach = computed(() => this.service.estimateAudienceSize(this.audienceSegmentIds()));

  readonly canSave = computed(
    () => this.title().trim().length > 0 && this.message().trim().length > 0 && this.audienceSegmentIds().length > 0
  );

  constructor(private readonly service: NotificationTriggerService) {
    this.segments = service.segments();
  }

  ngOnChanges(): void {
    if (this.trigger) {
      this.title.set(this.trigger.title);
      this.message.set(this.trigger.message);
      this.recurrence.set(this.trigger.recurrence);
      this.audienceSegmentIds.set(this.trigger.audienceSegmentIds);
      this.active.set(this.trigger.active);
    } else {
      this.title.set('');
      this.message.set('');
      this.recurrence.set(defaultRecurrenceRule());
      this.audienceSegmentIds.set([]);
      this.active.set(true);
    }
  }

  onSubmit(): void {
    if (!this.canSave()) return;
    this.save.emit({
      title: this.title().trim(),
      message: this.message().trim(),
      recurrence: this.recurrence(),
      audienceSegmentIds: this.audienceSegmentIds(),
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
