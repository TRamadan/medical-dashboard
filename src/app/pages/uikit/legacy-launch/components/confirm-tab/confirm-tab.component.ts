import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirm-tab',
  imports: [FormsModule],
  templateUrl: './confirm-tab.component.html',
  styleUrl: './confirm-tab.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmTabComponent {
  checks = signal({
    chk1: false,
    chk2: false,
    chk3: false,
    chk4: false,
    chk5: false
  });

  graduated = signal(false);

  allChecked = computed(() => {
    const c = this.checks();
    return c.chk1 && c.chk2 && c.chk3 && c.chk4 && c.chk5;
  });

  updateChecks() {
    this.checks.set({ ...this.checks() });
  }

  confirmGraduation() {
    this.graduated.set(true);
  }
}
