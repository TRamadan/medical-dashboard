import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
    selector: 'app-dynamic-report',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        CheckboxModule,
        InputSwitchModule,
        InputTextModule,
        FieldsetModule
    ],
    templateUrl: './dynamic-report.component.html',
})
export class DynamicReportComponent implements OnInit {
    reportForm!: FormGroup;

    muscularOptions = ['tb', 'tbt', 'tb3', 'tb4'];
    lengthOptions = ['l1', 'l2', 'l3', 'l4'];
    motionOptions = ['m1', 'm2', 'm3', 'm4'];

    tableColumns: { field: string; header: string }[] = [];
    tableData: any[] = [];

    reportGenerated = false;
    saveSuccess = false;

    constructor(private fb: FormBuilder, private http: HttpClient) { }

    ngOnInit() {
        this.reportForm = this.fb.group({
            reportName: [''],
            muscular: this.buildCheckboxGroup(this.muscularOptions),
            length: this.buildCheckboxGroup(this.lengthOptions),
            motion: this.buildCheckboxGroup(this.motionOptions),
            useExternalApi: [false],
            apiUrl: ['']
        });

        this.reportForm.get('useExternalApi')?.valueChanges.subscribe(useApi => {
            const apiUrlControl = this.reportForm.get('apiUrl');
            if (useApi) {
                apiUrlControl?.enable();
            } else {
                apiUrlControl?.disable();
            }
        });
        this.reportForm.get('apiUrl')?.disable();
    }

    buildCheckboxGroup(options: string[]): FormGroup {
        const group = this.fb.group({});
        options.forEach(option => {
            group.addControl(option, this.fb.control(false));
        });
        return group;
    }

    generateReport() {
        const formValue = this.reportForm.getRawValue();

        const muscularCols = Object.keys(formValue.muscular).filter(key => formValue.muscular[key]);
        const lengthCols = Object.keys(formValue.length).filter(key => formValue.length[key]);
        const motionCols = Object.keys(formValue.motion).filter(key => formValue.motion[key]);

        this.tableColumns = [...muscularCols, ...lengthCols, ...motionCols].map(col => ({ field: col, header: col.toUpperCase() }));

        if (formValue.useExternalApi && formValue.apiUrl) {
            this.http.get<any[]>(formValue.apiUrl).subscribe(data => {
                this.tableData = data;
                this.reportGenerated = true;
            });
        } else {
            this.tableData = [];
            this.reportGenerated = true;
        }
    }

    prepareReportPayload() {
        const formValue = this.reportForm.getRawValue();
        return {
            reportName: formValue.reportName,
            muscular: Object.keys(formValue.muscular).filter(key => formValue.muscular[key]),
            length: Object.keys(formValue.length).filter(key => formValue.length[key]),
            motion: Object.keys(formValue.motion).filter(key => formValue.motion[key]),
            useExternalApi: formValue.useExternalApi,
            apiUrl: formValue.apiUrl
        };
    }

    saveReport() {
        debugger
        const payload = this.prepareReportPayload();
        // Replace 'YOUR_API_ENDPOINT' with your actual endpoint
        this.http.post('YOUR_API_ENDPOINT', payload).subscribe({
            next: () => {
                this.saveSuccess = true;
            },
            error: () => {
                this.saveSuccess = false;
            }
        });
    }
} 