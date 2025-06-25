import { Component } from '@angular/core';
import { TotalsComponent } from "./totals/totals.component";
import { StatsComponent } from "./stats/stats.component";
import { InterstsComponent } from "./intersts/intersts.component";
import { EmployeeStatsTableComponent } from "./employee-stats/employee-stats-table.component";
@Component({
  selector: 'app-dashboard',
  imports: [TotalsComponent, StatsComponent, InterstsComponent, EmployeeStatsTableComponent],
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
