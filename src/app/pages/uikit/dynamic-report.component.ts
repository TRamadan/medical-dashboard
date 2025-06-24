import { Component, Input, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';

export interface ReportSection {
    type: 'text' | 'table';
    content?: string; // for text
    tableData?: any; // for table (static)
    tableColumns?: { label: string; field: string }[]; // for table
    apiUrl?: string; // for dynamic data
}

export interface ReportConfig {
    title?: string;
    sections: ReportSection[];
}

@Component({
    selector: 'app-dynamic-report',
    standalone: true,
    imports: [CommonModule, TableModule, ReactiveFormsModule, FloatLabelModule, ButtonModule],
    templateUrl: './dynamic-report.component.html',
})
export class DynamicReportComponent implements OnInit {
    @Input() config!: ReportConfig;
    fetchedTableData: { [sectionIndex: number]: any[] } = {};

    reportForm!: FormGroup;
    showConfigForm = false;

    constructor(private http: HttpClient, private fb: FormBuilder) { }

    ngOnInit() {
        this.initForm();
        if (this.config) {
            this.patchFormFromConfig(this.config);
            this.fetchAllApiData();
        }
    }

    initForm() {
        this.reportForm = this.fb.group({
            title: [''],
            sections: this.fb.array([])
        });
    }

    get sections(): FormArray {
        return this.reportForm.get('sections') as FormArray;
    }

    addSection() {
        this.sections.push(this.createSectionGroup());
    }

    removeSection(idx: number) {
        this.sections.removeAt(idx);
    }

    createSectionGroup(): FormGroup {
        return this.fb.group({
            type: ['text', Validators.required],
            content: [''],
            tableColumns: this.fb.array([]),
            apiUrl: ['']
        });
    }

    addTableColumn(sectionIdx: number) {
        const columns = this.sections.at(sectionIdx).get('tableColumns') as FormArray;
        columns.push(this.fb.group({ label: ['', Validators.required], field: ['', Validators.required] }));
    }

    removeTableColumn(sectionIdx: number, colIdx: number) {
        const columns = this.sections.at(sectionIdx).get('tableColumns') as FormArray;
        columns.removeAt(colIdx);
    }

    patchFormFromConfig(config: ReportConfig) {
        this.reportForm.patchValue({ title: config.title || '' });
        this.sections.clear();
        config.sections.forEach(section => {
            const group = this.createSectionGroup();
            group.patchValue({
                type: section.type,
                content: section.content || '',
                apiUrl: section.apiUrl || ''
            });
            const columns = group.get('tableColumns') as FormArray;
            (section.tableColumns || []).forEach(col => {
                columns.push(this.fb.group({ label: [col.label, Validators.required], field: [col.field, Validators.required] }));
            });
            this.sections.push(group);
        });
    }

    saveConfig() {
        const formValue = this.reportForm.value;
        this.config = {
            title: formValue.title,
            sections: formValue.sections.map((section: any) => ({
                type: section.type,
                content: section.content,
                tableColumns: section.tableColumns,
                apiUrl: section.apiUrl
            }))
        };
        this.fetchAllApiData();
        this.showConfigForm = false;
    }

    fetchAllApiData() {
        this.fetchedTableData = {};
        this.config.sections.forEach((section, idx) => {
            if (section.type === 'table' && section.apiUrl) {
                this.http.get<any[]>(section.apiUrl).subscribe(data => {
                    this.fetchedTableData[idx] = data;
                });
            }
        });
    }

    getTableData(section: ReportSection, idx: number): any[] {
        if (section.apiUrl) {
            return this.fetchedTableData[idx] || [];
        }
        return section.tableData || [];
    }

    getTableColumns(section: any): FormArray {
        return (section.get('tableColumns') as FormArray) || this.fb.array([]);
    }
} 