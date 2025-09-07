import { Component, OnInit } from '@angular/core';
import { Reporttemplates, SubCategory } from './models/reporttemplates';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { PatientsReportComponent } from '../patients-report/patients-report.component';
import { signal, ChangeDetectionStrategy } from '@angular/core';
import { TableComponent } from '../../../../shared/table/table.component';

@Component({
    selector: 'app-reports-configuration',
    imports: [TableComponent, PatientsReportComponent, ToggleSwitchModule, SelectModule, InputTextModule, FloatLabelModule, FormsModule, ReactiveFormsModule, CardModule, SelectButtonModule, ToolbarModule, ButtonModule, DialogModule],
    standalone: true,
    templateUrl: './reports-configuration.component.html',
    styleUrl: './reports-configuration.component.scss'
})
export class ReportsConfigurationComponent implements OnInit {
    reportTemplates: any[] = [];
    reportDialog: boolean = false;
    reportConfigForm!: FormGroup;
    selectedTemplateDetails: any[] = [];

    isEdit: boolean = false;
    isDelete: boolean = false;

    selectedSubCategories: SubCategory[] = [];

    // Signal to track selected report template IDs
    selectedReportTemplateIds = signal<number[]>([]);

    // Signal to track selected column IDs
    selectedColumns = signal<{ categoryId: number; columnId: number; columnName: string }[]>([]);

    readonly columns: Array<{
        label: string;
        field: string;
        type?: 'text' | 'image' | 'date' | 'boolean' | 'custom' | 'number';
        sortable?: boolean;
        filterable?: boolean;
        filterType?: 'text' | 'date' | 'numeric' | 'boolean';
        width?: string;
        customTemplate?: any;
    }> = [{ label: 'Report Name', field: 'name', type: 'text', sortable: true }];

    readonly data = signal([
        {
            id: 1,
            name: 'Hip Abduction	',
            createdAt: new Date(),
            reportTemplate: { id: 1, name: 'Balance' },
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
            ],
            isSavedForLater: false
        },

        {
            id: 2,
            name: 'Hip adduction	',
            createdAt: new Date(),
            reportTemplate: { id: 2, name: 'Adductor strength' },
            reportTemplateDetails: [
                { id: 1, name: 'Limb' },
                { id: 2, name: 'PP' },
                { id: 3, name: 'TP' },
                { id: 4, name: 'AP' },
                { id: 5, name: 'Assessor' }
            ],
            isSavedForLater: true
        }
    ]);

    private editingReportId: number | null = null;

    constructor(private _fb: FormBuilder) {}

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
            reportColumns: [null, Validators.required],
            templateName: [null, Validators.required],
            isSavedForLater: [false, Validators.required]
        });
        this.reportConfigForm.controls['reportColumns'].disable();
    }

    //here is the function needed to open a dialog responsible for adding a new report
    openAddReportDialog(): void {
        this.reportDialog = true;
    }

    //here is the function needed to close the dialog
    hideDialog(): void {
        this.reportDialog = false;
        this.selectedReportTemplateIds.set([]);
        this.reportConfigForm.reset();
    }

    //here is the function needed to save the report config
    saveReportConfig(): void {
        // Gather selected category IDs
        const selectedCategoryIds = this.selectedReportTemplateIds();

        // Gather selected columns (as names or IDs, depending on backend requirements)
        const selectedColumns = this.selectedColumns().map((col) => ({
            categoryId: col.categoryId,
            columnId: col.columnId,
            columnName: col.columnName
        }));

        // Gather selected subcategories if needed
        const selectedSubCategories = this.selectedSubCategories.map((sub) => ({
            id: sub.id,
            name: sub.name
        }));

        // Construct the body
        const body = {
            reportName: this.reportConfigForm.value.reportName,
            reportColumns: this.reportConfigForm.value.reportColumns,
            templateName: this.reportConfigForm.value.templateName,
            isSavedForLater: this.reportConfigForm.value.isSavedForLater,
            categories: selectedCategoryIds,
            columns: selectedColumns,
            subCategories: selectedSubCategories
        };

        // Example: send to backend (replace with your actual service call)
        // this.apiService.createReport(body).subscribe(...);

        console.log('Body to send:', body);
    }

    //here is the function needed to update the selected report config
    updateSelectedReportConfig(): void {
        if (this.editingReportId == null) return;
        const original = this.data().find((r) => r.id === this.editingReportId);
        if (!original) return;
        const updated = {
            ...original,
            name: this.reportConfigForm.value.reportName,
            reportColumns: this.reportConfigForm.value.reportColumns,
            templateName: this.reportConfigForm.value.templateName,
            isSavedForLater: this.reportConfigForm.value.isSavedForLater
            // All required fields are preserved from original
        };
        this.data.set(this.data().map((r) => (r.id === this.editingReportId ? updated : r)));
        this.isEdit = false;
        this.editingReportId = null;
        this.reportDialog = false;
        this.reportConfigForm.reset();
        this.selectedReportTemplateIds.set([]);
        this.selectedColumns.set([]);
    }

    //here is the function needed to disable the selected report config
    deleteSelectedReportConfig(): void {}

    //here is the function needed to set the data for the selected report config
    editSelectedReportConfig(): void {}

    //here is the function needed to get selected template details for chips display
    onTemplateChange(): void {
        const selectedTemplateId = this.reportConfigForm.get('reportTemplate')?.value;
        if (selectedTemplateId) {
            const selectedTemplate = this.reportTemplates.find((template) => template.id === selectedTemplateId);
            this.selectedTemplateDetails = selectedTemplate ? selectedTemplate.reportTemplateDetails : [];
        } else {
            this.selectedTemplateDetails = [];
        }
    }

    // Function to toggle selection of a report template card
    toggleReportTemplateSelection(reportTemplate: Reporttemplates) {
        const selected = this.selectedReportTemplateIds();
        const index = selected.indexOf(reportTemplate.id!);
        if (index > -1) {
            // Deselect
            this.selectedReportTemplateIds.set(selected.filter((id) => id !== reportTemplate.id));
        } else {
            // Select (add to selection)
            this.selectedReportTemplateIds.set([...selected, reportTemplate.id!]);
        }
    }

    // Function to toggle selection of a column
    onToggleColumn(categoryId: number, columnId: number, columnName: string) {
        const selected = this.selectedColumns();
        const index = selected.findIndex((c) => c.categoryId === categoryId && c.columnId === columnId);
        let newSelected;
        if (index > -1) {
            // Deselect
            newSelected = selected.filter((c) => !(c.categoryId === categoryId && c.columnId === columnId));
        } else {
            // Select
            newSelected = [...selected, { categoryId, columnId, columnName }];
        }
        this.selectedColumns.set(newSelected);

        // Set the form control value as a comma-separated string of selected column names
        this.reportConfigForm.get('reportColumns')?.setValue(newSelected.map((c) => c.columnName).join(', '));
    }

    isColumnSelected(categoryId: number, columnId: number): boolean {
        return this.selectedColumns().some((c) => c.categoryId === categoryId && c.columnId === columnId);
    }

    get selectedTemplatesWithDetails() {
        return this.reportTemplates
            .filter((t) => this.selectedReportTemplateIds().includes(t.id!))
            .map((t) => ({
                id: t.id, // add id for template use
                name: t.name,
                details: t.reportTemplateDetails
            }));
    }

    get selectedReportTemplateName(): string | undefined {
        const selectedId = this.selectedReportTemplateIds()[0];
        if (!selectedId) return undefined;
        const selected = this.reportTemplates.find((t) => t.id === selectedId);
        return selected?.name;
    }

    // Action handlers
    onEdit(report: any) {
        this.isEdit = true;
        this.reportDialog = true;
        this.editingReportId = report.id ?? null;

        // Patch form values
        this.reportConfigForm.patchValue({
            reportName: report.name ?? null,
            reportColumns: report.reportColumns ?? null,
            templateName: report.templateName ?? null,
            isSavedForLater: report.isSavedForLater ?? false
        });

        // Set selected categories
        if (report.reportTemplate?.id) {
            this.selectedReportTemplateIds.set([report.reportTemplate.id]);
            // Set subCategories based on selected category
            const selectedCategory = this.reportTemplates.find((t) => t.id === report.reportTemplate.id);
            this.selectedSubCategories = selectedCategory?.subCategories ?? [];
        } else {
            this.selectedReportTemplateIds.set([]);
            this.selectedSubCategories = [];
        }

        // Set selected columns if you store them in the report (optional)
        if (report.reportColumns) {
            const selectedNames = typeof report.reportColumns === 'string' ? report.reportColumns.split(',').map((s: string) => s.trim()) : [];
            this.selectedColumns.set([]); // Implement mapping if needed
        } else {
            this.selectedColumns.set([]);
        }
    }

    onDelete(report: unknown) {
        // Implement delete logic
        alert('Delete: ' + (report as any).name);
    }

    onDetails(report: unknown) {
        // Implement view details logic
        alert('Details: ' + (report as any).name);
    }

    //here is the function needed to handle toggle switch change
    onToggleChange(): void {
        // This method is called when the toggle switch changes
        // The template name input visibility is controlled by the template condition
    }
}
