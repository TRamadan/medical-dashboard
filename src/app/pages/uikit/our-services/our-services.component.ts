import { Component, OnInit } from '@angular/core';
import { DynamicReportComponent, ReportConfig } from "../../../../app/pages/uikit/dynamic-report.component";
@Component({
  standalone: true,
  imports: [DynamicReportComponent],
  selector: 'app-our-services',
  templateUrl: './our-services.component.html',
  styleUrls: ['./our-services.component.css']
})
export class OurServicesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  reportConfig: ReportConfig = {
    title: 'API Report',
    sections: [
      {
        type: 'table',
        tableColumns: [
          { label: 'ID', field: 'id' },
          { label: 'Name', field: 'name' }
        ],
        apiUrl: 'https://jsonplaceholder.typicode.com/users'
      }
    ]
  };

}
