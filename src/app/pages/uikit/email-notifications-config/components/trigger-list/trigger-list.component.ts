import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AudienceSegment, NotificationTrigger } from '../../models/notification-trigger.model';
import { describeRecurrence } from '../../models/recurrence.util';

@Component({
  selector: 'app-trigger-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, InputSwitchModule, ButtonModule, TagModule],
  templateUrl: './trigger-list.component.html',
  styleUrl: './trigger-list.component.scss',
})
export class TriggerListComponent {
  @Input({ required: true }) triggers: NotificationTrigger[] = [];
  @Input({ required: true }) segments: AudienceSegment[] = [];
  @Output() edit = new EventEmitter<NotificationTrigger>();
  @Output() toggleActive = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();

  describe(t: NotificationTrigger): string {
    return describeRecurrence(t.recurrence);
  }

  audienceNames(t: NotificationTrigger): string {
    const idSet = new Set(t.audienceSegmentIds);
    const names = this.segments.filter((s) => idSet.has(s.id)).map((s) => s.name);
    return names.length ? names.join(', ') : 'No audience selected';
  }
}
