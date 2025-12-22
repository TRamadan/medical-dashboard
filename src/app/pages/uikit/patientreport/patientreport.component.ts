import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepperModule } from 'primeng/stepper';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PatientInfoComponent } from './patient-info/patient-info.component';
import { PatientReportComponent } from './patient-report/patient-report.component';
import { ReportPreviewComponent } from './report-preview/report-preview.component';
import { PlanCofigComponent } from './plan-cofig/plan-cofig.component';
import { PhasesProtocolComponent } from './phases-protocol/phases-protocol.component';

@Component({
    selector: 'app-patientreport',
    imports: [CommonModule, StepperModule, CardModule, ButtonModule, PatientInfoComponent, PatientReportComponent, ReportPreviewComponent, PlanCofigComponent, PhasesProtocolComponent],
    templateUrl: './patientreport.component.html',
    styleUrl: './patientreport.component.scss'
})
export class PatientreportComponent {
    @ViewChild(PatientInfoComponent) patientInfo!: PatientInfoComponent;
    @ViewChild(PatientReportComponent) patientReport!: PatientReportComponent;
    @ViewChild(PlanCofigComponent) planConfig!: PlanCofigComponent;
    @ViewChild(PhasesProtocolComponent) phasesProtocol!: PhasesProtocolComponent;

    isTemplateSelected: boolean = false;
    isPatientSelected: boolean = false;
    previewData: any = null;

    // Persisted State
    selectedPatient: any = null;
    reportData: any = { injuryNames: [], description: '', recommendation: '' };
    planConfigData: any = { weeks: null, sessions: null, template: null };
    phasesData: any[] = [];

    onTemplateChange(selected: boolean) {
        this.isTemplateSelected = selected;
    }

    onPatientSelection(patient: any) {
        this.selectedPatient = patient;
        this.isPatientSelected = !!patient;
    }

    goBackToReview(activateCallback: Function) {
        this.isPatientSelected = false;
        // Optionally reset child component if it were alive, but simple state reset is sufficient due to recreation
        activateCallback(1);
    }

    goToPreview(activateCallback: Function) {
        this.previewData = {
            patient: this.selectedPatient,
            report: this.reportData,
            plan: {
                weeks: this.planConfigData.weeks,
                sessions: this.planConfigData.sessions,
                template: this.planConfigData.template
            },
            phases: this.phasesData
        };
        activateCallback(5);
    }
}
