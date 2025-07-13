import { Component, OnInit } from '@angular/core';
import { Reporttemplates } from './models/reporttemplates';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToolbarModule } from "primeng/toolbar";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { CardModule } from "primeng/card";
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { PatientsReportComponent } from "../patients-report/patients-report.component";

@Component({
  selector: 'app-reports-configuration',
  imports: [PatientsReportComponent, ToggleSwitchModule, SelectModule, InputTextModule, FloatLabelModule, FormsModule, ReactiveFormsModule, CardModule, SelectButtonModule, ToolbarModule, ButtonModule, DialogModule],
  standalone: true,
  templateUrl: './reports-configuration.component.html',
  styleUrl: './reports-configuration.component.scss'
})
export class ReportsConfigurationComponent implements OnInit {
  reportTemplates: Reporttemplates[] = [];
  reportDialog: boolean = false;
  reportConfigForm !: FormGroup;
  selectedTemplateDetails: any[] = [];

  isEdit: boolean = false;
  isDelete: boolean = false;

  constructor(private _fb: FormBuilder) { }

  //Limb, Score,Level,Static Balance, Dynamic Balance, Pop Up L-R, Pop Up T-B, Horizontal Movement, Vertical Movement, Clockwise Rotation, Counter-clockwise Rotation, Constant Movement, Pop Up Random Locations
  ngOnInit(): void {
    this.reportTemplates = [
      {
        id: 1,
        name: 'Balance',
        reportTemplateDetails: [
          { id: 1, name: 'Limb' },
          { id: 2, name: 'Score' },
          { id: 3, name: 'Level' },
          { id: 4, name: 'Static Balance' },
          { id: 5, name: 'Dynamic Balance' },
          { id: 6, name: 'Pop Up L-R' },
          { id: 7, name: 'Pop Up T-B' },
          { id: 8, name: 'Horizontal Movement' },
          { id: 9, name: 'Vertical Movement' },
          { id: 10, name: 'Clockwise Rotation' },
          { id: 11, name: 'Counter-clockwise Rotation' },
          { id: 12, name: 'Constant Movement' },
          { id: 13, name: 'Pop Up Random Locations' }
        ]
      },
      {
        id: 2,
        name: 'Adductor strength',
        reportTemplateDetails: [
          { id: 1, name: 'Limb' },
          { id: 2, name: 'PP' },
          { id: 3, name: 'TP' },
          { id: 4, name: 'AP' },
          { id: 5, name: 'Assessor' },
          { id: 6, name: 'Date' }
        ]
      },
      {
        id: 3,
        name: 'Power',
        reportTemplateDetails: [
          { id: 1, name: 'Date' },
          { id: 2, name: 'Power Test' },
          { id: 3, name: 'Test Results' }
        ]
      }
    ];
    this.initialiseFormReport();
  }

  //here is the function needed to initialise form controls to add a new report 
  initialiseFormReport(): void {
    this.reportConfigForm = this._fb.group({
      reportName: [null, Validators.required],
      reportTemplate: [null, Validators.required],
      templateName: [null, Validators.required],
      isSavedForLater: [false, Validators.required]
    })
  }

  //here is the function needed to open a dialog responsible for adding a new report 
  openAddReportDialog(): void {
    this.reportDialog = true;
  }

  //here is the function needed to close the dialog 
  hideDialog(): void {
    this.reportDialog = false
  }

  //here is the function needed to save the report config  
  saveReportConfig(): void { }

  //here is the function needed to update the selected report config 
  updateSelectedReportConfig(): void { }

  //here is the function needed to disable the selected report config 
  deleteSelectedReportConfig(): void { }

  //here is the function needed to set the data for the selected report config 
  editSelectedReportConfig(): void { }

  //here is the function needed to get selected template details for chips display
  onTemplateChange(): void {
    const selectedTemplateId = this.reportConfigForm.get('reportTemplate')?.value;
    if (selectedTemplateId) {
      const selectedTemplate = this.reportTemplates.find(template => template.id === selectedTemplateId);
      this.selectedTemplateDetails = selectedTemplate ? selectedTemplate.reportTemplateDetails : [];
    } else {
      this.selectedTemplateDetails = [];
    }
  }

  //here is the function needed to handle toggle switch change
  onToggleChange(): void {
    // This method is called when the toggle switch changes
    // The template name input visibility is controlled by the template condition
  }
}
