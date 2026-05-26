import { Component, ChangeDetectionStrategy } from '@angular/core';

import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-comparison-tab',
  imports: [CardModule],
  templateUrl: './comparison-tab.component.html',
  styleUrl: './comparison-tab.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComparisonTabComponent { }
