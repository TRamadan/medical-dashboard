import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { UserType, AudienceUser } from '../../models/notification-trigger.model';

@Component({
  selector: 'app-audience-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiSelectModule, TagModule],
  templateUrl: './audience-selector.component.html',
  styleUrl: './audience-selector.component.scss',
})
export class AudienceSelectorComponent {
  @Input({ required: true }) userTypes: UserType[] = [];
  @Input({ required: true }) users: AudienceUser[] = [];

  @Input() set selectedUserTypeIds(ids: string[]) {
    this._selectedUserTypeIds.set(ids ?? []);
  }
  @Input() set selectedUserIds(ids: string[]) {
    this._selectedUserIds.set(ids ?? []);
  }

  @Output() selectedUserTypeIdsChange = new EventEmitter<string[]>();
  @Output() selectedUserIdsChange = new EventEmitter<string[]>();

  readonly _selectedUserTypeIds = signal<string[]>([]);
  readonly _selectedUserIds = signal<string[]>([]);

  /** Users belonging to any of the currently selected user types. */
  readonly availableUsers = computed(() => {
    const typeIds = new Set(this._selectedUserTypeIds());
    if (typeIds.size === 0) return [];
    return this.users.filter((u) => typeIds.has(u.userTypeId));
  });

  readonly selectedUsersCount = computed(() => this._selectedUserIds().length);

  onUserTypeChange(ids: string[]): void {
    this._selectedUserTypeIds.set(ids ?? []);
    this.selectedUserTypeIdsChange.emit(ids ?? []);

    // Drop any selected users that no longer belong to a selected user type.
    const availableIds = new Set(this.availableUsers().map((u) => u.id));
    const pruned = this._selectedUserIds().filter((id) => availableIds.has(id));
    if (pruned.length !== this._selectedUserIds().length) {
      this._selectedUserIds.set(pruned);
      this.selectedUserIdsChange.emit(pruned);
    }
  }

  onUserChange(ids: string[]): void {
    this._selectedUserIds.set(ids ?? []);
    this.selectedUserIdsChange.emit(ids ?? []);
  }
}