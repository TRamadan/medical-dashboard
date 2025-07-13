import { Component, TemplateRef, ViewChild } from '@angular/core';
import { TabsComponent, TabItem } from '../../../shared/tabs/tabs.component';
import { ReportsConfigurationComponent } from "./reports-configuration/reports-configuration.component";
import { CardModule } from "primeng/card";
@Component({
  selector: 'app-reports-config',
  imports: [CardModule, TabsComponent, ReportsConfigurationComponent],
  templateUrl: './reports-config.component.html',
  styleUrl: './reports-config.component.css'
})
export class ReportsConfigComponent {
  tabs: TabItem[] = [
    {
      label: 'Reservation Form Config',
      content: 'Reservation form configuration content will go here'
    },
    {
      label: 'Report Config',
      content: 'Report configuration content will go here'
    }
  ];
  @ViewChild('Customers') formConfigTab!: TemplateRef<any>;
  @ViewChild('Employees') reportsConfigTab!: TemplateRef<any>;
}
