import { Component, OnInit } from '@angular/core';
import { DynamicReportComponent } from "../dynamic-report.component";
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

}
