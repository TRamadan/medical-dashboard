import { Component, ChangeDetectionStrategy } from '@angular/core';

import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-summary-tab',
  imports: [CardModule],
  templateUrl: './summary-tab.component.html',
  styleUrl: './summary-tab.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryTabComponent { }
