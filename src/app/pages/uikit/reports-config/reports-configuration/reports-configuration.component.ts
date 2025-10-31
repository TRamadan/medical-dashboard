import { Component, OnInit } from '@angular/core';
import { Reporttemplates, SubCategory } from '../models/reporttemplates';
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
import { signal } from '@angular/core';
import { TableComponent } from '../../../../shared/table/table.component';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
    selector: 'app-reports-configuration',
    imports: [TableComponent, ToggleSwitchModule, SelectModule, InputTextModule, FloatLabelModule, FormsModule, ReactiveFormsModule, CardModule, SelectButtonModule, ToolbarModule, ButtonModule, DialogModule, ConfirmDialog, Toast],
    standalone: true,
    providers: [ConfirmationService, MessageService],

    templateUrl: './reports-configuration.component.html',
    styleUrl: './reports-configuration.component.scss'
})
export class ReportsConfigurationComponent implements OnInit {
    reportConfigForm!: FormGroup;
    selectedSubCategories: SubCategory[] = [];
    selectedReportTemplateIds = signal<number[]>([]);
    isEdit: boolean = false;
    isDelete: boolean = false;
    reportDialog: boolean = false;
    private editingReportId: number | null = null;
    reportTemplates: any[] = [];
    isAddCategoryItem: boolean = false;
    isAddSubCategoryItem: boolean = false;
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

    constructor(private _fb: FormBuilder) {}

    ngOnInit(): void {
        this.initialiseFormReport();
    }

    initialiseFormReport(): void {
        this.reportConfigForm = this._fb.group({
            reportName: [null, Validators.required],
            reportColumns: [null, Validators.required],
            templateName: [null, Validators.required],
            isSavedForLater: [false, Validators.required]
        });
        this.reportConfigForm.controls['reportColumns'].disable();
    }

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

    //here is the function needed to open the dialog responsible for add a new item (report, category and subcategory)
    openAddItemDialog(item: string) {
        switch (item) {
            case 'category':
                this.isAddCategoryItem = true;
                break;
            case 'subcategory':
                this.isAddSubCategoryItem = true;
                break;
            case 'report':
                this.reportDialog = true;
                break;
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

    onDelete(report: unknown) {
        // Implement delete logic
        alert('Delete: ' + (report as any).name);
    }

    //here is the function needed to handle toggle switch change
    onToggleChange(): void {
        // This method is called when the toggle switch changes
        // The template name input visibility is controlled by the template condition
    }

    isColumnSelected(categoryId: number, columnId: number): boolean {
        return this.selectedColumns().some((c) => c.categoryId === categoryId && c.columnId === columnId);
    }

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

    //here is the function needed to close the dialog
    hideDialog(): void {
        this.reportDialog = false;
        this.selectedReportTemplateIds.set([]);
        this.reportConfigForm.reset();
    }
}
