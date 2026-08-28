import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardOverviewDto } from '../../../models/coach-manager-api.model';

@Component({
  selector: 'app-kpi-cards',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kpi-cards.component.html',
  styleUrl: './kpi-cards.component.scss'
})
export class KpiCardsComponent {
  data = input<DashboardOverviewDto | null>(null);
}
