import { Component, ChangeDetectionStrategy, inject, signal, OnInit, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { ProtocolService } from '../../services/protocol.service';
import { getPhaseSessionCount, getProtocolSessions, Phase } from '../../models/protocol.model';
import { ReactiveFormsModule } from "@angular/forms";
import { InputNumberModule } from "primeng/inputnumber";
import { DropdownModule } from "primeng/dropdown";
import { MeasurementCategoriesService } from '../../../measurements-config/services/measurement-categories.service';

export interface CriterionOption {
    label: string;
    value: string;
    operator: '>=' | '<=';
    unit: string;
    defaultValue: number;
}

@Component({
    selector: 'app-phases-and-criteria',
    imports: [DropdownModule, InputNumberModule, ReactiveFormsModule, CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, InputTextarea],
    templateUrl: './phases-and-criteria.component.html',
    styleUrl: './phases-and-criteria.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})


export class PhasesAndCriteriaComponent implements OnInit {
    public protocolService = inject(ProtocolService);
    private measurementService = inject(MeasurementCategoriesService);
    readonly protocol = this.protocolService.activeProtocol;
    readonly getPhaseSessionCount = getPhaseSessionCount;
    readonly getSessionNumbers = getProtocolSessions;

    readonly readonly = input(false);
    private fb = inject(FormBuilder);

    constructor() {
        effect(() => {
            if (!this.form) return;
            this.readonly() ? this.form.disable() : this.form.enable();
        });
    }
    form!: FormGroup;

    metricOptions = signal<{ label: string; value: string; unit: string; defaultValue: number }[]>([]);
    private metricsMap = new Map<string, { unit: string; defaultValue: number }>();

    operatorOptions = [
        { label: '≥', value: '≥' },
        { label: '≤', value: '≤' },
        { label: '>', value: '>' },
        { label: '<', value: '<' },
        { label: '=', value: '=' }
    ];


    get phases(): Phase[] {
        return this.protocol()?.phases ?? [];
    }

    ngOnInit(): void {
        this.form = this.fb.group({});

        const proto = this.protocol();
        if (proto) {
            proto.phases.forEach(phase => {
                this.initPhaseCriteria(phase);
            });
        }

        this.loadMetrics();
    }

    private initPhaseCriteria(phase: Phase): void {
        const criteriaArray = this.fb.array<FormGroup>([]);

        // Populate from existing phase transition criteria if any
        if (phase.criteria?.transitionCriteria?.length > 0) {
            phase.criteria.transitionCriteria.forEach(tc => {
                criteriaArray.push(this.fb.group({
                    id: [tc.id],
                    metric: [tc.metric, Validators.required],
                    operator: [tc.operator || ''],
                    unit: [tc.unit || ''],
                    value: [tc.value || 0, Validators.required],
                }));
            });
        }

        this.form.addControl(phase.id, criteriaArray, { emitEvent: false });

        // Sync this specific phase's criteria back to the protocol
        criteriaArray.valueChanges.subscribe(values => {
            this.protocolService.activeProtocol.update(proto => {
                if (!proto) return proto;
                const targetPhase = proto.phases.find(p => p.id === phase.id);
                if (targetPhase) {
                    targetPhase.criteria.transitionCriteria = values.map((c: any, index: number) => ({
                        id: c.id || (Date.now() + index),
                        metric: c.metric,
                        operator: c.operator,
                        value: c.value,
                        unit: c.unit
                    }));
                }
                return { ...proto };
            });
            this.protocolService.notifyChange();
        });
    }

    private loadMetrics(): void {
        this.measurementService.getAllSubCategories().subscribe({
            next: (subCategories) => {
                const options: { label: string; value: string; unit: string; defaultValue: number }[] = [];
                subCategories.forEach(sub => {
                    if (sub.category?.description === 'Objective Category') {
                        sub.measurements.forEach((m: any) => {
                            const option = {
                                label: m.name,
                                value: m.name,
                                unit: m.unit || '',
                                defaultValue: m.minValue || 0
                            };
                            options.push(option);
                            this.metricsMap.set(m.name, { unit: m.unit || '', defaultValue: m.minValue || 0 });
                        });
                    }
                });
                this.metricOptions.set(options);

                // Initialize empty phases with one default item
                const proto = this.protocol();
                if (proto && options.length > 0) {
                    proto.phases.forEach((phase: any) => {
                        const array = this.getCriteriaArray(phase.id);
                        if (array && array.length === 0) {
                            this.addCriterion(phase);
                        }
                    });
                }
            }
        });
    }

    addPhase(index?: number): void {
        this.protocolService.activeProtocol.update(proto => {
            if (!proto) return proto;
            
            const maxId = proto.phases.reduce((max, p) => {
                const idNum = parseInt(p.id, 10);
                return isNaN(idNum) ? max : Math.max(max, idNum);
            }, 0);
            const newPhase = this.protocolService.createPhase(maxId + 1);

            // Initialize form array for the new phase
            this.initPhaseCriteria(newPhase);

            let newPhases = [...proto.phases];
            if (typeof index === 'number') {
                newPhases.splice(index + 1, 0, newPhase);
            } else {
                newPhases.push(newPhase);
            }

            return {
                ...proto,
                phases: newPhases
            };
        });
    }

    removePhase(index: number): void {
        this.protocolService.activeProtocol.update(proto => {
            if (!proto || index <= 0) return proto;
            const phaseToRemove = proto.phases[index];
            this.form.removeControl(phaseToRemove.id);

            const newPhases = [...proto.phases];
            newPhases.splice(index, 1);
            return {
                ...proto,
                phases: newPhases
            };
        });
    }

    getSessionsArray(count: number | string | null | undefined): number[] {
        return this.protocolService.getRange(Number(count) || 0);
    }

    /** Per-phase Set of selected session numbers — keeps Phase model clean */

    toggleSessionSelection(phase: Phase, sessionNum: number): void {
        this.protocolService.activeProtocol.update(proto => {
            if (!proto) return proto;

            // Find the phase in the signal's data to ensure we're updating the right object
            const targetPhase = proto.phases.find(p => p.id === phase.id);
            if (!targetPhase) return proto;

            if (!targetPhase.measurementSessionNums) targetPhase.measurementSessionNums = [];

            const idx = targetPhase.measurementSessionNums.indexOf(sessionNum);
            if (idx > -1) {
                targetPhase.measurementSessionNums = targetPhase.measurementSessionNums.filter(n => n !== sessionNum);
                // Restore default section if it's now an exercise session
                const session = targetPhase.weeks
                    .flatMap(w => w.sessions)
                    .find(s => s.sessionNumber === sessionNum);
                if (session) {
                    if (session.sections.length === 0) {
                        session.sections = [{ sectionName: 'Warm Up', time: '10 min', exercises: [] }];
                    }
                    session.measurementTemplateId = null;
                }
            } else {
                targetPhase.measurementSessionNums = [...targetPhase.measurementSessionNums, sessionNum];
                
                // Clear sections if it's now a measurement session
                const session = targetPhase.weeks
                    .flatMap(w => w.sessions)
                    .find(s => s.sessionNumber === sessionNum);
                if (session) {
                    session.sections = [];
                }
            }

            return { ...proto };
        });
    }

    isSessionSelected(phase: Phase, sessionNum: number): boolean {
        return phase.measurementSessionNums?.includes(sessionNum) ?? false;
    }

    getCriteriaArray(phaseId: string): FormArray<FormGroup> {
        return this.form.get(phaseId) as FormArray<FormGroup>;
    }

    getCriteriaControls(phaseId: string): FormGroup[] {
        return this.getCriteriaArray(phaseId)?.controls as FormGroup[] || [];
    }

    private buildRow(metricValue: string, value: number): FormGroup {
        const meta = this.metricsMap.get(metricValue);
        return this.fb.group({
            id: [Date.now()],
            metric: [metricValue, Validators.required],
            operator: [''], // Default operator
            unit: [meta?.unit || ''],
            value: [value, [Validators.required]],
        });
    }

    addCriterion(phase: Phase): void {
        const options = this.metricOptions();
        if (options.length > 0) {
            const array = this.getCriteriaArray(phase.id);
            array.push(this.buildRow(options[0].value, options[0].defaultValue));
        }
    }

    removeCriterion(phase: Phase, index: number): void {
        this.getCriteriaArray(phase.id).removeAt(index);
    }

    /** Call this when the metric dropdown changes to sync operator & unit */
    onMetricChange(phase: Phase, index: number, metricValue: string): void {
        const meta = this.metricsMap.get(metricValue);
        if (!meta) return;
        const row = this.getCriteriaArray(phase.id).at(index) as FormGroup;
        row.patchValue({ unit: meta.unit, value: meta.defaultValue });
    }
}
