import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from "primeng/card";
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  label: string;
  field: string;
  type?: 'text' | 'image' | 'date' | 'boolean' | 'custom' | 'number';
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
  imports: [
    CardModule,
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    DatePipe,
    InputNumberModule,
    FormsModule
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {
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
  @Input() showCheckbox: boolean = false;
  @Input() showSpotsColumn: boolean = false;
  @Input() spotsPerRow: number = 2;

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() details = new EventEmitter<any>();
  @Output() addDetails = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();

  selectedItems: any[] = [];
  filters: { [key: string]: any } = {};
  globalFilterValue: string = '';

  get searchFields(): string[] {
    return this.headers.map(h => h.field);
  }

  onEdit(row: any) {
    this.edit.emit(row);
  }

  onDelete(row: any) {
    this.delete.emit(row);
  }

  onViewDetails(row: any) {
    this.details.emit(row);
  }

  onAddDetails(row: any) {
    this.addDetails.emit(row)
  }

  onSelectionChange(event: any) {
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
}
