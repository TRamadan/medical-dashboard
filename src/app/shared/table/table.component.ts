import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { environment } from '../../../environments/environment';
import { Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { Component } from '@angular/core';

export interface TableColumn {
    label: string;
    field: string;
    type?: 'text' | 'image' | 'date' | 'boolean' | 'custom' | 'number' | 'link';
    sortable?: boolean;
    filterable?: boolean;
    filterType?: 'text' | 'date' | 'numeric' | 'boolean';
    width?: string;
    customTemplate?: any;
}

export interface TableAction {
    label: string;
    icon: string;
    type: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    onClick: (row: any) => void;
    tooltip?: string;
    show?: (row: any) => boolean;
}

@Component({
    selector: 'app-table',
    standalone: true,
    imports: [CardModule, CommonModule, TableModule, ButtonModule, InputTextModule, TooltipModule, DatePipe, InputNumberModule, FormsModule, TagModule],
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss'
})
export class TableComponent {
    public readonly imgUrl = environment.imgUrlWebsite;
    @Input() headers: TableColumn[] = [];
    @Input() data: any[] = [];
    @Input() showActions: boolean = false;
    @Input() loading: boolean = false;
    @Input() paginator: boolean = true;
    @Input() rows: number = 10;
    @Input() showCurrentPageReport: boolean = true;
    @Input() rowsPerPageOptions: number[] = [5, 10, 25, 50];
    @Input() globalFilterFields: string[] = [];
    @Input() emptyMessage: string = 'No records found';
    @Input() selectionMode: 'single' | 'multiple' | null = null;
    @Input() actions: TableAction[] = [];
    @Input() responsive: boolean = true;
    @Input() scrollable: boolean = false;
    @Input() scrollHeight: string = '';
    @Input() showGlobalFilter: boolean = true;
    @Input() globalFilterPlaceholder: string = 'Search...';
    @Input() isAddDetails: boolean = false;
    @Input() isShowDetails: boolean = false;
    @Input() showEditButton: boolean = true;
    @Input() showDeleteButton: boolean = true;
    @Input() showCheckbox: boolean = false;
    @Input() showSpotsColumn: boolean = false;
    @Input() spotsPerRow: number = 2;
    @Input() selectedItems: any[] = [];

    @Output() edit = new EventEmitter<any>();
    @Output() delete = new EventEmitter<any>();
    @Output() details = new EventEmitter<any>();
    @Output() addDetails = new EventEmitter<any>();
    @Output() selectionChange = new EventEmitter<any[]>();
    @Output() selectedItemsChange = new EventEmitter<any[]>();

    @ContentChild('details', { read: TemplateRef }) detailsTemplate: TemplateRef<any> | null = null;

    get searchFields(): string[] {
        return this.headers.map((h) => h.field);
    }

    onEdit(row: any) {
        this.edit.emit(row);
    }

    onDelete(row: any) {
        this.delete.emit(row);
    }

    onViewDetails(row: any) {
        const wasOpen = row.showDetails;

        // Close all other detail rows if you only want one open at a time
        this.data.forEach((item) => {
            item.showDetails = false;
        });

        // Open the clicked row if it was closed
        if (!wasOpen) {
            row.showDetails = true;
        }
    }

    onAddDetails(row: any) {
        this.addDetails.emit(row);
    }

    onToggleDetails(row: any) {
        row.showDetails = !row.showDetails;
    }

    onSelectionChange(event: any) {
        this.selectedItems = event;
        this.selectedItemsChange.emit(this.selectedItems);
        this.selectionChange.emit(this.selectedItems);
    }

    // Utility to create an array for ngFor
    createSpotsArray(count: number): number[] {
        return Array(count).fill(0);
    }

    // Handle spot value change
    onSpotChange(row: any, index: number, value: number): void {
        if (!row.spots) {
            row.spots = Array(this.spotsPerRow).fill(1);
        }
        row.spots[index] = value;
    }

    expandedRows: { [key: string]: boolean } = {};

    toggleRow(row: any, event: Event) {
        event.preventDefault();

        if (this.isRowExpanded(row)) {
            delete this.expandedRows[row.id];
        } else {
            // Only one expanded at a time
            this.expandedRows = {};
            this.expandedRows[row.id] = true;
        }
    }

    isRowExpanded(row: any): boolean {
        return this.expandedRows[row.id] === true;
    }

    openFile(link: string): void {
        window.open(this.imgUrl + link, '_blank', 'noopener,noreferrer');
    }
}
