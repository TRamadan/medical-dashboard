import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from "primeng/card";

export interface TableColumn {
  label: string;
  field: string;
  type?: 'text' | 'image' | 'date' | 'boolean' | 'custom';
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
    DatePipe
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

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() details = new EventEmitter<any>();
  @Output() addDetails = new EventEmitter<any>();


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

}
