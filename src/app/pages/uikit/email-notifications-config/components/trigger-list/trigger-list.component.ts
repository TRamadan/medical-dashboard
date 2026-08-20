import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AudienceUser, NotificationTrigger, UserType } from '../../models/notification-trigger.model';
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
  @Input() userTypes: UserType[] = [];
  @Input() users: AudienceUser[] = [];
  @Output() edit = new EventEmitter<NotificationTrigger>();
  @Output() toggleActive = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();

  private readonly notificationTypeLabels: Record<string, string> = {
    session_booking: 'حجز جلسة',
    session_confirmation: 'تأكيد جلسة',
    session_reschedule_cancel: 'الغاء او اعادة جدولة الجلسة',
    stage_transition: 'الانتقال لمرحلة جديدة في البرنامج',
    measurement_results: 'نتائج قياسات',
    report_released: 'نزول تقرير',
    session_delay: 'تأخير عن بداية الجلسة',
    program_completion: 'انتهاء البرنامج',
    birthday: 'اعياد الميلاد',
  };

  typeLabel(value: string): string {
    return this.notificationTypeLabels[value] ?? value;
  }

  describe(t: NotificationTrigger): string {
    return describeRecurrence(t.recurrence);
  }

  audienceNames(t: NotificationTrigger): string {
    const parts: string[] = [];
    if (t.userTypeIds?.length) {
      const typeSet = new Set(t.userTypeIds);
      const names = this.userTypes.filter((ut) => typeSet.has(ut.id)).map((ut) => ut.name);
      if (names.length) parts.push(...names);
    }
    if (t.userIds?.length) {
      parts.push(`${t.userIds.length} user(s)`);
    }
    return parts.length ? parts.join(', ') : 'No audience selected';
  }
}
