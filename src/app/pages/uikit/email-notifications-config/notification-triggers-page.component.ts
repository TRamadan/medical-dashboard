import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { NotificationTriggerService } from './services/notification-trigger.service';
import { TriggerListComponent } from './components/trigger-list/trigger-list.component';
import { TriggerFormComponent } from './components/trigger-form/trigger-form.component';
import { NotificationTriggerDetail, NotificationTriggerPayload } from './models/notification-trigger.model';

type ViewMode = 'list' | 'form';

@Component({
  selector: 'app-notification-triggers-page',
  imports: [CommonModule, ButtonModule, CardModule, MessageModule, TriggerListComponent, TriggerFormComponent],
  templateUrl: './notification-triggers-page.component.html',
  styleUrl: './notification-triggers-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationTriggersPageComponent implements OnInit {
  private readonly service = inject(NotificationTriggerService);

  readonly triggers = this.service.triggers;
  readonly activeCount = this.service.activeCount;
  readonly totalCount = this.service.totalCount;
  readonly triggerTypes = this.service.triggerTypes;
  readonly audienceOptions = this.service.audienceOptions;
  readonly audienceUsers = this.service.audienceUsers;
  readonly loading = this.service.loading;

  readonly view = signal<ViewMode>('list');
  readonly editingTrigger = signal<NotificationTriggerDetail | null>(null);
  readonly saving = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.service.loadTriggers().subscribe();
    this.service.loadTypes().subscribe();
    this.service.loadAudienceOptions().subscribe();
    this.service.loadUsers().subscribe();
  }

  openCreate(): void {
    this.errorMessage.set(null);
    this.editingTrigger.set(null);
    this.view.set('form');
  }

  openEdit(id: number): void {
    this.errorMessage.set(null);
    this.service.getTriggerById(id).subscribe({
      next: (detail) => {
        this.editingTrigger.set(detail);
        this.view.set('form');
      },
      error: () => {
        this.errorMessage.set('Failed to fetch trigger details.');
      },
    });
  }

  backToList(): void {
    this.errorMessage.set(null);
    this.view.set('list');
    this.editingTrigger.set(null);
  }

  onSave(payload: NotificationTriggerPayload): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    const editing = this.editingTrigger();
    const action$ = editing
      ? this.service.updateTrigger(editing.id, payload)
      : this.service.createTrigger(payload);

    action$.subscribe({
      next: () => {
        this.saving.set(false);
        this.backToList();
      },
      error: (err) => {
        this.saving.set(false);
        const serverErrors = err?.error?.errors;
        if (Array.isArray(serverErrors) && serverErrors.length) {
          this.errorMessage.set(serverErrors.join(' • '));
        } else {
          this.errorMessage.set(err?.error?.message || 'Failed to save trigger. Please check inputs.');
        }
      },
    });
  }

  onToggleActive(id: number): void {
    this.service.toggleActive(id).subscribe();
  }

  onRemove(id: number): void {
    this.service.deleteTrigger(id).subscribe();
  }
}

