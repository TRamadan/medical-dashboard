import { Component, ChangeDetectionStrategy } from '@angular/core';

import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-launch-sidebar',
  imports: [CardModule],
  templateUrl: './launch-sidebar.component.html',
  styleUrl: './launch-sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchSidebarComponent { }
