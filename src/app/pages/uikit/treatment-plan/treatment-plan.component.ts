import { Component, OnInit } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ToolbarModule } from 'primeng/toolbar';
import { TreatmentPlan } from './models/treatmnetplan';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    selector: 'app-treatment-plan',
    imports: [
        CheckboxModule,
        InputNumberModule,
        DatePickerModule,
        InputTextModule,
        SelectModule,
        FloatLabelModule,
        CardModule,
        ToolbarModule,
        InputIconModule,
        IconFieldModule,
        DialogModule,
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        ToastModule,
        ReactiveFormsModule
    ],
    templateUrl: './treatment-plan.component.html',
    styleUrls: ['./treatment-plan.component.css']
})
export class TreatmentPlanComponent implements OnInit {
    allPatients: any[] = [];
    sessionActivities: any[] = [];
    addTreatmentPlanForm!: FormGroup;
    allTreatmentPlans: TreatmentPlan[] = [];
    treatmentPlanDialog: boolean = false;
    isEdit: boolean = false;
    isNew: boolean = false;
    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
        this.getAllPatients();
        this.getAllTreatmentPlans();
        this.initialiseTreatmentPlanForm();
    }

    //here is the function needed to initialise treatment plan form
    initialiseTreatmentPlanForm(): void {
        this.addTreatmentPlanForm = this.fb.group({
            patient: [null, Validators.required],
            injuryType: [null, Validators.required],
            treatmentplanDetails: this.fb.group({
                description: [null, Validators.required],
                startDate: [null, Validators.required],
                totalNumberOfSessions: [null, Validators.required],
                sessions: this.fb.array([])
            })
        });
    }

    //here is the function needed to create the formcontrols for the sessions form array
    createTreatmentSession(): FormGroup {
        return this.fb.group({
            sessionName: [null, Validators.required],
            noOfSessionsPerWeek: [null, Validators.required],
            noOSessionsPerMonth: [null, Validators.required],
            duration: [null, Validators.required],
            sessionStatus: [null, Validators.required],
            sessionDate: [null, Validators.required],
            activities: this.fb.array([])
        });
    }

    get treatmentSessions(): FormArray {
        return this.addTreatmentPlanForm.get('treatmentplanDetails.sessions') as FormArray;
    }

    addTreatmentSession() {
        this.treatmentSessions.push(this.createTreatmentSession());
    }

    getActivitiesArray(sessionIndex: number): FormArray {
        return this.treatmentSessions.at(sessionIndex).get('activities') as FormArray;
    }

    getActivitiesValue(sessionIndex: number): any[] {
        return this.getActivitiesArray(sessionIndex).value;
    }

    //here is the function needed to remove a session configuration for the treatement plan
    removeTreatmentSession(index: number) {
        this.treatmentSessions.removeAt(index);
    }

    //here is the function needed to get all registered and verified patients
    getAllPatients(): void {}

    //here is the function needed to get all added treatment plans
    getAllTreatmentPlans(): void {}

    //here is the function needed to open a dialog to add a treatment plan
    addTreatmentPlanDialog(): void {
        const sessions = this.treatmentSessions;
        sessions.clear();
        this.addTreatmentPlanForm.reset();
        this.treatmentPlanDialog = true;
        this.isNew = true;
        this.addTreatmentSession();
    }

    //here is the function needed to hide dialog
    hideDialog() {
        this.treatmentPlanDialog = false;
        const sessions = this.treatmentSessions;
        sessions.clear();
        this.addTreatmentPlanForm.reset();
        // this.treatmentSessions.clear();
    }

    //here is the function needed to push another session activity for a single session in treatment plan
    pushAnotherSessionActivity(sessionIndex: number) {
        debugger;
        const sessionForm = this.treatmentSessions.at(sessionIndex);
        const formValue = sessionForm.value;

        if (!formValue.sessionName || !formValue.sessionDate) {
            return;
        }

        const activitiesArray = this.getActivitiesArray(sessionIndex);

        const newActivity = this.fb.group({
            id: [Date.now()],
            name: [formValue.sessionName],
            date: [formValue.sessionDate],
            numberPerWeek: [formValue.noOfSessionsPerWeek],
            numberPerMonth: [formValue.noOSessionsPerMonth],
            duration: [formValue.duration]
        });

        activitiesArray.push(newActivity);
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 1/6/2025
     * Porpuse : fetch accurate data by search in an input in the desired table
     * @param table
     * @param event
     */
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
