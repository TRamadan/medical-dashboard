import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { ProtocolService } from '../../services/protocol.service';
import { AssignEmployeeBranchService } from '../../../add-employees-to-branch/services/assign-employee-branch.service';
import { Protocol, ProtocolKind, TreatmentPlanFilter } from '../../models/protocol.model';

@Component({
    selector: 'app-all-protocols',
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        TagModule,
        ButtonModule,
        TooltipModule,
        BadgeModule,
        DialogModule,
        InputTextModule,
        ToastModule,
        DropdownModule,
    ],
    templateUrl: './all-protocols.component.html',
    styleUrl: './all-protocols.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService],
})
export class AllProtocolsComponent implements OnInit {
    public protocolService = inject(ProtocolService);
    private readonly route = inject(ActivatedRoute);
    private readonly messageService = inject(MessageService);
    private readonly assignEmployeeBranchService = inject(AssignEmployeeBranchService);

    readonly protocols = this.protocolService.protocols;

    // ── Active Tab (Published | Drafted) ──────────────────────────────────────
    readonly activeTab = signal<'Published' | 'Drafted'>('Drafted');

    // ── Template Filter (all | patient | template) in both tabs ───────────────
    readonly templateFilter = signal<'all' | 'patient' | 'template'>('all');

    // ── Coach Manager Dialog (Location & Coach dropdowns) ──────────────────────
    readonly showAssignDialog = signal(false);
    readonly selectedPlanForAssign = signal<Protocol | null>(null);
    readonly locations = signal<any[]>([]);
    readonly coachManagers = signal<any[]>([]);
    selectedLocationId: number | null = null;
    selectedDoctorId: string | null = null;
    readonly assigningCoachManager = signal(false);
    readonly highlightedPlanId = signal<number | null>(null);
    private autoOpenAssignDialog = false;

    constructor() {
        this.logProtocols();
        effect(() => {
            const planId = this.highlightedPlanId();
            const list = this.filteredProtocols();
            if (planId && list.length > 0) {
                const target = list.find(p => p.id === planId);
                if (target) {
                    setTimeout(() => {
                        const el = document.getElementById("protocol-card-" + planId);
                        if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                        if (this.autoOpenAssignDialog) {
                            this.autoOpenAssignDialog = false;
                            this.openAssignDialog(target);
                        }
                    }, 300);
                }
            }
        });
    }

    ngOnInit(): void {
        this.route.queryParamMap.subscribe(params => {
            const tabParam = params.get('tab');
            const templateParam = params.get('template');
            const highlightParam = params.get('highlightPlanId') ?? params.get('treatmentPlanId');
            const autoAssignParam = params.get('autoAssign');

            if (highlightParam) {
                const id = Number(highlightParam);
                if (!isNaN(id)) {
                    this.highlightedPlanId.set(id);
                }
            }
            if (autoAssignParam === 'true') {
                this.autoOpenAssignDialog = true;
            }

            if (templateParam === 'true') {
                this.templateFilter.set('template');
            } else if (templateParam === 'false') {
                this.templateFilter.set('patient');
            }

            if (tabParam === 'Published') {
                this.activeTab.set('Published');
            } else if (tabParam === 'Template') {
                this.activeTab.set('Published');
                this.templateFilter.set('template');
            } else if (tabParam === 'Drafted') {
                this.activeTab.set('Drafted');
            }
            this.loadProtocols();
        });
    }

    getFilter(): TreatmentPlanFilter {
        const tab = this.activeTab();
        const filter = this.templateFilter();

        if (tab === 'Published') {
            switch (filter) {
                case 'patient':
                    return { kind: 'Published', status: 'Published', isTemplate: false };
                case 'template':
                    return { kind: 'Template', status: 'Published', isTemplate: true };
                case 'all':
                default:
                    return { status: 'Published' };
            }
        } else {
            // Drafted
            switch (filter) {
                case 'patient':
                    return { kind: 'Drafted', status: 'Draft', isTemplate: false };
                case 'template':
                    return { kind: 'Drafted', status: 'Draft', isTemplate: true };
                case 'all':
                default:
                    return { kind: 'Drafted', status: 'Draft' };
            }
        }
    }

    loadProtocols(): void {
        const filter = this.getFilter();
        this.protocolService.fetchProtocols(filter);
    }

    loadProtocolsForTab(tab?: 'Published' | 'Drafted' | ProtocolKind): void {
        if (tab === 'Published' || tab === 'Drafted') {
            this.activeTab.set(tab);
        }
        this.loadProtocols();
    }

    /**
     * Kind detection helper:
     * - Returns protocol.kind if already set.
     * - Fallback:
     *   - status === 'Draft' -> 'Drafted'
     *   - patientId != null && !isTemplate -> 'Published' (running patient plan)
     *   - Otherwise -> 'Template' (ready template)
     */
    detectKind(p: Protocol): ProtocolKind {
        if (p.kind === 'Published' || p.kind === 'Template' || p.kind === 'Drafted') {
            return p.kind;
        }
        if (p.status === 'Draft') return 'Drafted';
        if (p.patientId != null && !p.isTemplate) return 'Published';
        return 'Template';
    }

    readonly filteredProtocols = computed(() => {
        const list = this.protocols();
        const filter = this.templateFilter();
        if (filter === 'template') {
            return list.filter(p => p.isTemplate === true || this.detectKind(p) === 'Template');
        }
        if (filter === 'patient') {
            return list.filter(p => !p.isTemplate && this.detectKind(p) !== 'Template');
        }
        return list;
    });

    logProtocols(): void {
        effect(() => {
            console.log(this.filteredProtocols());
        });
    }

    setTab(tab: 'Published' | 'Drafted'): void {
        this.activeTab.set(tab);
        this.loadProtocols();
    }

    setTemplateFilter(filter: 'all' | 'patient' | 'template'): void {
        this.templateFilter.set(filter);
        this.loadProtocols();
    }

    viewProtocol(protocol: Protocol): void {
        this.protocolService.viewProtocol(protocol);
    }

    editProtocol(protocol: Protocol): void {
        this.protocolService.editProtocol(protocol);
    }

    canAssignToPatient(p: Protocol): boolean {
        return (p.isTemplate === true || this.detectKind(p) === 'Template') && p.status !== 'Draft';
    }

    assignToPatient(protocol: Protocol, event?: Event): void {
        event?.stopPropagation();
        this.protocolService.assignProtocol(protocol);
    }

    getKindSeverity(kind?: string): 'success' | 'warn' | 'danger' | 'info' {
        switch (kind) {
            case 'Published': return 'success';
            case 'Template': return 'info';
            case 'Drafted': return 'warn';
            default: return 'info';
        }
    }

    getKindIcon(kind?: string): string {
        switch (kind) {
            case 'Published': return 'pi pi-check-circle';
            case 'Template': return 'pi pi-folder';
            case 'Drafted': return 'pi pi-pencil';
            default: return 'pi pi-info-circle';
        }
    }

    getKindLabel(p: Protocol): string {
        const kind = this.detectKind(p);
        if (kind === 'Drafted') {
            return p.patientId ? 'Patient Draft' : 'Template Draft';
        }
        return kind;
    }

    // ── Coach Manager helpers ─────────────────────────────────────────────────

    /**
     * "Running plan" in TREATMENT_PLAN_FULL_CYCLE.md = kind === "Published"
     */
    isRunning(p: Protocol): boolean {
        return this.detectKind(p) === 'Published';
    }

    canAssignCoachManager(p: Protocol): boolean {
        return this.isRunning(p);
    }

    fetchLocations(): void {
        this.assignEmployeeBranchService.getBranches().subscribe({
            next: (data) => {
                this.locations.set((data || []).map((item: any) => ({
                    label: `${item.nameEn} - ${item.nameAr}`,
                    id: item.id
                })));
            },
            error: (err) => console.error('Failed to fetch locations', err)
        });
    }

    onLocationChange(locationId: number): void {
        this.selectedDoctorId = null;
        this.coachManagers.set([]);
        if (locationId) {
            this.assignEmployeeBranchService.getBranchEmployees(locationId).subscribe({
                next: (employees: any) => {
                    this.coachManagers.set(employees?.data ?? employees ?? []);
                },
                error: (err) => console.error('Failed to fetch coach managers', err)
            });
        }
    }

    openAssignDialog(protocol: Protocol, event?: Event): void {
        event?.stopPropagation();
        this.selectedPlanForAssign.set(protocol);
        this.selectedLocationId = null;
        this.selectedDoctorId = protocol.coachManagerId ? String(protocol.coachManagerId) : null;
        this.coachManagers.set([]);
        this.showAssignDialog.set(true);
        this.fetchLocations();
    }

    isAssignDisabled(): boolean {
        if (!this.selectedDoctorId || this.assigningCoachManager()) {
            return true;
        }
        const currentCoachId = this.selectedPlanForAssign()?.coachManagerId;
        return currentCoachId != null && String(currentCoachId) === String(this.selectedDoctorId);
    }

    confirmAssign(): void {
        const plan = this.selectedPlanForAssign();
        const coachManagerId = this.selectedDoctorId ? Number(this.selectedDoctorId) : null;
        if (!plan || !coachManagerId) return;

        this.assigningCoachManager.set(true);
        this.protocolService.assignCoachManager(plan.id, coachManagerId).subscribe({
            next: (updatedPlan) => {
                this.protocolService.protocols.update(list =>
                    list.map(p => p.id === updatedPlan.id ? updatedPlan : p)
                );
                const assignedName =
                    updatedPlan.coachManagerNameEn ||
                    updatedPlan.coachManagerNameAr ||
                    'Coach manager';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Assigned',
                    detail: `${assignedName} will run this plan.`,
                });
                this.assigningCoachManager.set(false);
                this.showAssignDialog.set(false);
            },
            error: (err) => {
                const apiError =
                    err?.error?.error?.errors?.[0]?.errorEn ??
                    'Failed to assign coach manager.';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: apiError,
                });
                this.assigningCoachManager.set(false);
            },
        });
    }
}
