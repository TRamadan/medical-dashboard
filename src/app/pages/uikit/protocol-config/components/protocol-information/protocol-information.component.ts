import { Component, ChangeDetectionStrategy, inject, OnInit, effect, input, signal, DestroyRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, takeUntil } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProtocolService } from '../../services/protocol.service';
import { ServicecategoryService } from '../../../add-service/services/servicecategory.service';
import { ProtocolTemplate, ServiceItem } from '../../models/protocol.model';
import { ReactiveFormsModule } from '@angular/forms';
import { ServicesService } from '../../../add-service/services/services.service';
@Component({
    selector: 'app-protocol-information',
    imports: [ReactiveFormsModule, CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, InputTextarea, CheckboxModule, DropdownModule, InputNumberModule],
    templateUrl: './protocol-information.component.html',
    styleUrl: './protocol-information.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtocolInformationComponent implements OnInit {
    public protocolService = inject(ProtocolService);
    form!: FormGroup;
    private services = inject(ServicesService);

    readonly readonly = input(false);

    private fb = inject(FormBuilder);

    constructor() {
        effect(() => {
            if (!this.form) return;
            this.readonly() ? this.form.disable() : this.form.enable();
        });
    }

    protocol = this.protocolService.activeProtocol;

    servicesSignal = signal<ServiceItem[]>([]);
    loadingServices = signal(false);
    serviceCategoriesError = signal<string | null>(null);
    selectedService: any = null;
    useTemplate = false;
    selectedTemplate: ProtocolTemplate | null = null;
    loadingTemplateDetails = signal(false);

    athleteLevelOptions = [
        { label: 'Recreational', value: 'recreational' },
        { label: 'Amateur', value: 'amateur' },
        { label: 'Semi-Professional', value: 'semi_pro' },
        { label: 'Professional', value: 'professional' },
        { label: 'Elite / Near-Professional', value: 'elite' },
    ];

    defaultContraindications = [
        { id: 1, description: 'Pain > 7/10 at start of exercise — Stop and notify the doctor', order: 1 },
        { id: 2, description: 'New acute joint swelling within 24 hours of last session', order: 2 },
        { id: 3, description: 'Fever > 38°C or signs of local inflammation', order: 3 },
    ];

    templates = computed<ProtocolTemplate[]>(() => {
        return this.protocolService.protocols().map((p: any) => {
            const weeks = p.weeks || (p.phases?.reduce((sum: number, ph: any) => sum + (ph.totalWeeks || 0), 0)) || 0;
            const sessions = p.totalSessions || (p.phases?.reduce((sum: number, ph: any) => sum + ((ph.totalWeeks || 0) * (ph.sessionsPerWeek || 0)), 0)) || 0;
            
            return {
                id: p.id,
                title: p.name,
                subtitle: p.injuryCondition || 'General Protocol',
                description: p.primaryGoal || 'Professional treatment plan template.',
                duration: `${weeks} weeks`,
                frequency: `${weeks > 0 ? (sessions / weeks).toFixed(1) : 0}x/week`,
                phases: `${p.numberOfPhases || p.phases?.length || 0} phases`
            };
        });
    });

    ngOnInit(): void {
        this.form = this.fb.group({
            // Basic Details
            protocolName: ['', Validators.required],
            injuryCondition: ['', Validators.required],
            primaryGoal: [
                '',
                Validators.required
            ],

            // General Framework
            totalWeeks: ['', [Validators.required, Validators.min(1)]],
            sessionsPerWeek: ['', [Validators.required, Validators.min(1)]],
            numberOfPhases: ['', [Validators.required, Validators.min(1)]],
            athleteLevel: ['', Validators.required],

            // Contraindications
            contraindications: this.fb.array([]),
            newContraindication: [''],
        });

        // Pre-populate form from active protocol (e.g. when returning to this step)
        const existing = this.protocol();
        if (existing) {
            this.form.patchValue({
                protocolName: existing.name ?? '',
                injuryCondition: existing.injuryCondition ?? '',
                primaryGoal: existing.primaryGoal ?? '',
                totalWeeks: (existing as any).weeks ?? '',
                sessionsPerWeek: (existing as any).sessionsPerWeek ?? '',
                numberOfPhases: existing.numberOfPhases ?? existing.phases?.length ?? '',
                athleteLevel: existing.targetAthleteLevel ?? '',
            }, { emitEvent: false });

            // Fill contraindications
            const contra = existing.contraindications || this.defaultContraindications;
            const arr = this.contraindications;
            arr.clear();
            contra.forEach((c: any) => {
                arr.push(this.fb.group({
                    id: [c.id || null],
                    description: [typeof c === 'string' ? c : c.description, Validators.required],
                    order: [c.order || arr.length + 1]
                }));
            });
        }

        // Keep activeProtocol in sync whenever the form changes
        this.form.valueChanges.subscribe(values => {
            const proto = this.protocol();
            if (!proto) return;
            proto.name = values.protocolName ?? proto.name;
            proto.injuryCondition = values.injuryCondition ?? '';
            proto.primaryGoal = values.primaryGoal ?? '';
            proto.weeks = values.totalWeeks ?? null;
            proto.numberOfPhases = values.numberOfPhases ?? null;
            proto.targetAthleteLevel = values.athleteLevel ?? '';
            proto.contraindications = values.contraindications ?? [];
            this.protocolService.notifyChange();
        });

        this.loadServices();
    }

    loadServices(): void {
        this.loadingServices.set(true);
        this.serviceCategoriesError.set(null);

        this.services.getServices().pipe(
            finalize(() => this.loadingServices.set(false))
        ).subscribe({
            next: (data) => {
                const protoServices = this.protocol()?.services || [];
                this.servicesSignal.set(
                    data.map((item: any) => ({
                        id: item.id,
                        serviceNameEn: item.nameEn || '',
                        serviceNameAr: item.nameAr || '',
                        selected: protoServices.some(s => s.id === item.id)
                    }))
                );
            },
            error: (err) => {
                console.error('Failed to load service categories', err);
                this.serviceCategoriesError.set('Failed to load services. Please try again.');
            }
        });
    }

    toggleService(service: ServiceItem): void {
        this.servicesSignal.update(categories =>
            categories.map(c => c.id === service.id ? { ...c, selected: !c.selected } : c)
        );
        this.onServiceChange();
    }

    onServiceChange(): void {
        const proto = this.protocol();
        const selected = this.servicesSignal().filter(c => c.selected);
        if (proto) {
            proto.services = selected.length > 0 ? selected : [];
        }
    }

    onConfigChange(): void {
        // triggers change detection via protocol signal
    }

    onToggleTemplate(): void {
        if (!this.useTemplate) {
            this.selectedTemplate = null;
            const proto = this.protocol();
            if (proto) {
                proto.template = null;
                proto.weeks = null;
                proto.totalSessions = null;
            }
        }
    }

    selectTemplate(template: ProtocolTemplate): void {
        this.selectedTemplate = template;
        const proto = this.protocol();
        if (!proto) return;

        // Fetch full protocol details to clone it
        this.loadingTemplateDetails.set(true);
        this.protocolService.getTreatmentPlanById(template.id).pipe(
            finalize(() => this.loadingTemplateDetails.set(false))
        ).subscribe({
            next: (fullTemplate) => {
                const active = this.protocol();
                if (!active) return;

                // Clone important fields but keep current ID and name if already started?
                // Actually usually selecting a template replaces most logic
                active.template = template;
                active.name = fullTemplate.name;
                active.injuryCondition = fullTemplate.injuryCondition;
                active.primaryGoal = fullTemplate.primaryGoal;
                active.targetAthleteLevel = fullTemplate.targetAthleteLevel;
                active.phases = JSON.parse(JSON.stringify(fullTemplate.phases)); // Deep clone phases
                active.contraindications = [...(fullTemplate.contraindications || [])];
                active.weeks = fullTemplate.weeks;
                active.totalSessions = fullTemplate.totalSessions;

                // Update form to reflect template changes
                this.form.patchValue({
                    injuryCondition: active.injuryCondition || '',
                    primaryGoal: active.primaryGoal || '',
                    athleteLevel: active.targetAthleteLevel || '',
                    totalWeeks: (fullTemplate as any).weeks || '',
                    sessionsPerWeek: fullTemplate.phases[0]?.sessionsPerWeek || '',
                    numberOfPhases: fullTemplate.phases.length || '',
                    protocolName: active.name || '',
                });

                // Clear and refill contraindications FormArray
                const arr = this.contraindications;
                arr.clear();
                (active.contraindications || []).forEach((c: any) => {
                    arr.push(this.fb.group({
                        id: [c.id || null],
                        description: [typeof c === 'string' ? c : c.description, Validators.required],
                        order: [c.order || arr.length + 1]
                    }));
                });

                this.protocolService.notifyChange();
            },
            error: (err) => console.error('Failed to load template details:', err)
        });
    }

    get contraindications(): FormArray {
        return this.form.get('contraindications') as FormArray;
    }

    addContraindication(): void {
        const val = this.form.get('newContraindication')?.value?.trim();
        if (val) {
            this.contraindications.push(this.fb.group({
                id: [null],
                description: [val, Validators.required],
                order: [this.contraindications.length + 1]
            }));
            this.form.get('newContraindication')?.reset();
        }
    }

    removeContraindication(index: number): void {
        this.contraindications.removeAt(index);
    }

    onSubmit(): void {
        if (this.form.valid) {
            console.log(this.form.value);
        }
    }
}
