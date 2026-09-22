import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TagModule } from 'primeng/tag';
import { AudienceOption, AudienceUserItem } from '../../models/notification-trigger.model';

@Component({
  selector: 'app-audience-selector',
  imports: [CommonModule, FormsModule, MultiSelectModule, InputSwitchModule, TagModule],
  templateUrl: './audience-selector.component.html',
  styleUrl: './audience-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudienceSelectorComponent {
  readonly audienceOptions = input<AudienceOption[]>([]);
  readonly audienceUsers = input<AudienceUserItem[]>([]);
  readonly selectedRoleIds = input<number[]>([]);
  readonly includePatients = input<boolean>(false);
  readonly selectedUserIds = input<number[]>([]);

  readonly selectedRoleIdsChange = output<number[]>();
  readonly includePatientsChange = output<boolean>();
  readonly selectedUserIdsChange = output<number[]>();

  readonly searchFilter = signal<string>('');

  readonly totalAudienceReach = computed(() => {
    const roles = this.selectedRoleIds().length;
    const hasPatients = this.includePatients();
    const specificUsers = this.selectedUserIds().length;

    const parts: string[] = [];
    if (roles > 0) parts.push(`${roles} role(s)`);
    if (hasPatients) parts.push('All Patients');
    if (specificUsers > 0) parts.push(`${specificUsers} specific user(s)`);

    return parts.length > 0 ? parts.join(' + ') : 'No audience targeted';
  });

  readonly isAudienceSelected = computed(
    () => this.selectedRoleIds().length > 0 || this.includePatients() || this.selectedUserIds().length > 0
  );

  onRoleChange(ids: number[]): void {
    this.selectedRoleIdsChange.emit(ids ?? []);
  }

  onPatientsChange(value: boolean): void {
    this.includePatientsChange.emit(value);
  }

  onUserChange(ids: number[]): void {
    this.selectedUserIdsChange.emit(ids ?? []);
  }
}