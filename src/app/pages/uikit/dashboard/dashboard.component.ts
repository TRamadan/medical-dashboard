import { Component } from '@angular/core';
import { ToolbarModule } from "primeng/toolbar";
@Component({
  selector: 'app-dashboard',
  imports: [ToolbarModule],
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
