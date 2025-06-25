import { Component } from '@angular/core';
import { ToolbarModule } from "primeng/toolbar";
import { CardModule } from "primeng/card";
@Component({
  selector: 'app-totals',
  imports: [ToolbarModule, CardModule],
  standalone: true,
  templateUrl: './totals.component.html',
  styleUrl: './totals.component.scss'
})
export class TotalsComponent {

}
