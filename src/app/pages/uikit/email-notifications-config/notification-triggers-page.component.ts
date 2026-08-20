import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { NotificationTriggerService } from './services/notification-trigger.service';
import { TriggerListComponent } from './components/trigger-list/trigger-list.component';
import { TriggerFormComponent, TriggerFormValue } from './components/trigger-form/trigger-form.component';
import { NotificationTrigger } from './models/notification-trigger.model';
import { CardModule } from "primeng/card";
type ViewMode = 'list' | 'form';

@Component({
  selector: 'app-notification-triggers-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, TriggerListComponent, TriggerFormComponent, CardModule],
  templateUrl: './notification-triggers-page.component.html',
  styleUrl: './notification-triggers-page.component.scss',
})
export class NotificationTriggersPageComponent {
  private readonly service = inject(NotificationTriggerService);

  readonly triggers = this.service.triggers;
  readonly userTypes = this.service.userTypes;
  readonly users = this.service.users;
  readonly segments = this.service.segments;
  readonly activeCount = this.service.activeCount;

  readonly view = signal<ViewMode>('list');
  readonly editingTrigger = signal<NotificationTrigger | null>(null);

  constructor() { }

  openCreate(): void {
    this.editingTrigger.set(null);
    this.view.set('form');
  }

  openEdit(trigger: NotificationTrigger): void {
    this.editingTrigger.set(trigger);
    this.view.set('form');
  }

  backToList(): void {
    this.view.set('list');
    this.editingTrigger.set(null);
  }

  onSave(value: TriggerFormValue): void {
    const editing = this.editingTrigger();
    if (editing) {
      this.service.updateTrigger(editing.id, value).subscribe(() => this.backToList());
    } else {
      this.service.createTrigger(value).subscribe(() => this.backToList());
    }
  }

  onToggleActive(id: string): void {
    this.service.toggleActive(id);
  }

  onRemove(id: string): void {
    this.service.deleteTrigger(id);
  }
}
