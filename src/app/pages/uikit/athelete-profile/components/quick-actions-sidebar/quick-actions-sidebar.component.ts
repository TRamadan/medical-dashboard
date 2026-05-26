import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { CardModule } from "primeng/card";

@Component({
  selector: 'app-quick-actions-sidebar',
  standalone: true,
  imports: [CommonModule, DividerModule, CardModule],
  templateUrl: './quick-actions-sidebar.component.html',
  styleUrl: './quick-actions-sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickActionsSidebarComponent {
  actions = input<any[]>([]);
  selectedAction = signal<string | null>(null);

  onActionClick(actionId: string) {
    this.selectedAction.set(actionId);
  }
}
