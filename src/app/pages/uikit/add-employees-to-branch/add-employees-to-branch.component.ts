import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NgSelectModule } from '@ng-select/ng-select';
import { AssignEmployeeBranchService } from './services/assign-employee-branch.service';
import { Branch, Employee, EmployeeType } from './models/assign-employee-branch';
import { Subject, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

const EMPLOYEE_PAGE_SIZE = 20;

@Component({
    selector: 'app-add-employees-to-branch',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DropdownModule,
        ButtonModule,
        CardModule,
        TableModule,
        ToastModule,
        NgSelectModule
    ],
    templateUrl: './add-employees-to-branch.component.html',
    styleUrls: ['./add-employees-to-branch.component.css'],
    providers: [MessageService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEmployeesToBranchComponent implements OnInit, OnDestroy {
    private readonly fb = inject(FormBuilder);
    private readonly assignService = inject(AssignEmployeeBranchService);
    private readonly messageService = inject(MessageService);

    // Form definition
    assignForm!: FormGroup;

    // Component signals
    branches = signal<Branch[]>([]);
    employeeTypes = signal<EmployeeType[]>([]);
    allEmployees = signal<Employee[]>([]);
    assignedEmployees = signal<Employee[]>([]);
    isLoading = signal<boolean>(false);
    isActionLoading = signal<boolean>(false);
    errorMessage = signal<string | null>(null);

    // Paginated employee loading
    employeePage = signal<number>(1);
    employeeTotalCount = signal<number>(0);
    isEmployeesLoading = signal<boolean>(false);
    hasMoreEmployees = computed(() => this.allEmployees().length < this.employeeTotalCount());

    // Server-side search
    employeeSearchTerm = signal<string>('');
    private readonly _searchSubject = new Subject<string>();
    private readonly _destroy$ = new Subject<void>();

    // Selected branch and filter state signals
    selectedBranchId = signal<string | number | null>(null);
    selectedFilterEmployeeTypeId = signal<string | number>('');

    // Derived outputs using computed()
    assignedEmployeesCount = computed(() => this.assignedEmployees().length);
    // isFormInvalid = computed(() => !this.assignForm || this.assignForm.invalid);

    isFormInvalid(): boolean {
        return !this.assignForm || this.assignForm.invalid;
    }


    selectedBranchName = computed(() => {
        const branchId = this.selectedBranchId();
        const branchSelect = this.branches().find(b => String(b.id) === String(branchId));
        return branchSelect ? (branchSelect.nameEn || '') : 'None';
    });

    // Filtered available employees based on already assigned ones
    availableEmployees = computed(() => {
        const assignedIds = new Set(this.assignedEmployees().map(e => String(e.id)));
        return this.allEmployees().filter(e => !assignedIds.has(String(e.id)));
    });

    /** Typed accessor for the userId FormControl used by ng-select */
    get userIdControl(): FormControl {
        return this.assignForm.get('userId') as FormControl;
    }

    ngOnInit() {
        this.initializeForm();
        this.loadInitialData();

        // Debounce search input — wait 300 ms after typing stops, then re-fetch from page 1
        this._searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this._destroy$)
        ).subscribe(term => {
            this.employeeSearchTerm.set(term);
            this._resetEmployeeList();
            this.loadMoreEmployees();
        });
    }

    ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
    }

    private initializeForm() {
        this.assignForm = this.fb.group({
            branchId: ['', [Validators.required]],
            userId: ['', [Validators.required]]
        });

        // Sync selectedBranchId signal configuration when form branchId changes
        this.assignForm.get('branchId')?.valueChanges.subscribe((branchId) => {
            this.selectedBranchId.set(branchId || null);
            this.loadBranchEmployees();
        });
    }

    private loadInitialData() {
        this.isLoading.set(true);
        this.errorMessage.set(null);

        forkJoin({
            branches: this.assignService.getBranches(),
            types: this.assignService.getEmployeeTypes()
        }).subscribe({
            next: (res: any) => {
                this.branches.set(res.branches || []);
                this.employeeTypes.set(res.types || []);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.errorMessage.set(err.message || 'Failed to load configuration lists.');
                this.isLoading.set(false);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Load Error',
                    detail: this.errorMessage() || 'Unknown error occurred.'
                });
            }
        });

        // Load first page of employees independently
        this.loadMoreEmployees();
    }

    /**
     * Load the next page of employees and append to allEmployees.
     * Called on component init, on dropdown scroll, and after search reset.
     */
    loadMoreEmployees() {
        if (this.isEmployeesLoading() || (!this.hasMoreEmployees() && this.employeePage() > 1)) {
            return;
        }
        this.isEmployeesLoading.set(true);
        const search = this.employeeSearchTerm();
        this.assignService.getAppUsers(this.employeePage(), EMPLOYEE_PAGE_SIZE, search).subscribe({
            next: (res: any) => {
                const items: Employee[] = res?.items ?? res?.data ?? (Array.isArray(res) ? res : []);
                const total: number = res?.totalCount ?? res?.total ?? items.length;
                this.employeeTotalCount.set(total);
                this.allEmployees.update(current => [...current, ...items]);
                this.employeePage.update(p => p + 1);
                this.isEmployeesLoading.set(false);
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Employees Load Error',
                    detail: err.message || 'Failed to load employees.'
                });
                this.isEmployeesLoading.set(false);
            }
        });
    }

    /** Push the typed search term into the debounce subject */
    onEmployeeSearch(event: { term: string }) {
        this._searchSubject.next(event.term ?? '');
    }

    /** Reset search and reload the unpaged list when the user clears the input */
    onEmployeeSearchClear() {
        this._searchSubject.next('');
    }

    /** Reset pagination + employee list before a fresh fetch */
    private _resetEmployeeList() {
        this.allEmployees.set([]);
        this.employeePage.set(1);
        this.employeeTotalCount.set(0);
    }

    /**
     * Triggered when filter conditions or selected branch changes
     */
    loadBranchEmployees() {
        const branchId = this.selectedBranchId();
        if (!branchId) {
            this.assignedEmployees.set([]);
            return;
        }
        this.isLoading.set(true);
        const filterTypeId = this.selectedFilterEmployeeTypeId();
        this.assignService.getBranchEmployees(branchId, filterTypeId).subscribe({
            next: (data: any) => {
                this.assignedEmployees.set(data.data || []);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Fetch Error',
                    detail: err.message || 'Failed to fetch branch employees.'
                });
                this.isLoading.set(false);
            }
        });
    }

    /**
     * Perform the assignment request
     */
    onSubmitAssignment() {
        if (this.assignForm.invalid) {
            this.assignForm.markAllAsTouched();
            return;
        }

        const { branchId, userId } = this.assignForm.value;
        this.isActionLoading.set(true);

        this.assignService.assignEmployeeToBranch(branchId, userId).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Employee assigned to branch successfully.'
                });
                // Reset employee control but keep selected branch
                this.assignForm.get('userId')?.reset('');
                this.isActionLoading.set(false);
                // Reload list
                this.loadBranchEmployees();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Assignment Failed',
                    detail: err.message || 'Error assigning employee.'
                });
                this.isActionLoading.set(false);
            }
        });
    }

    /**
     * Triggered when filter dropdown value is changed
     */
    onFilterChange(event: any) {
        this.selectedFilterEmployeeTypeId.set(event.value !== null ? event.value : '');
        this.loadBranchEmployees();
    }

}
