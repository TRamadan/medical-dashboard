import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { LaunchHeroComponent } from './components/launch-hero/launch-hero.component';
import { LaunchSidebarComponent } from './components/launch-sidebar/launch-sidebar.component';
import { ComparisonTabComponent } from './components/comparison-tab/comparison-tab.component';
import { SummaryTabComponent } from './components/summary-tab/summary-tab.component';
import { NextPathTabComponent } from './components/next-path-tab/next-path-tab.component';
import { VictoryTabComponent } from './components/victory-tab/victory-tab.component';
import { ConfirmTabComponent } from './components/confirm-tab/confirm-tab.component';

@Component({
  selector: 'app-legacy-launch',
  imports: [
    TabViewModule,
    LaunchHeroComponent,
    LaunchSidebarComponent,
    ComparisonTabComponent,
    SummaryTabComponent,
    NextPathTabComponent,
    VictoryTabComponent,
    ConfirmTabComponent
  ],
  templateUrl: './legacy-launch.component.html',
  styleUrl: './legacy-launch.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegacyLaunchComponent {
  status = signal('GRADUATION_READY');
}
