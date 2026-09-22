import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { NotificationTriggerListItem } from '../../models/notification-trigger.model';

@Component({
  selector: 'app-trigger-list',
  imports: [CommonModule, FormsModule, TableModule, InputSwitchModule, ButtonModule, TagModule, SkeletonModule],
  templateUrl: './trigger-list.component.html',
  styleUrl: './trigger-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriggerListComponent {
  readonly triggers = input<NotificationTriggerListItem[]>([]);
  readonly loading = input<boolean>(false);

  readonly edit = output<number>();
  readonly toggleActive = output<number>();
  readonly remove = output<number>();

  onToggleActive(id: number): void {
    this.toggleActive.emit(id);
  }

  onEdit(id: number): void {
    this.edit.emit(id);
  }

  onRemove(id: number): void {
    this.remove.emit(id);
  }
}

