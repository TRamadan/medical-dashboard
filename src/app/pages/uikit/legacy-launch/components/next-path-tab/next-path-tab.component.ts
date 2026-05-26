import { Component, ChangeDetectionStrategy } from '@angular/core';

import { CardModule } from 'primeng/card';
import { signal } from '@angular/core';

@Component({
  selector: 'app-next-path-tab',
  imports: [CardModule],
  templateUrl: './next-path-tab.component.html',
  styleUrl: './next-path-tab.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NextPathTabComponent {
  selectedPath = signal<string>('shield');

  selectPath(path: string) {
    this.selectedPath.set(path);
  }
}
