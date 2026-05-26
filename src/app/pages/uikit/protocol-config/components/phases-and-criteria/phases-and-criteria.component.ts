import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
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


export class PhasesAndCriteriaComponent {
    private protocolService = inject(ProtocolService);
    readonly protocol = this.protocolService.activeProtocol;
    readonly getPhaseSessionCount = getPhaseSessionCount;
    readonly getSessionNumbers = getProtocolSessions;

    private fb = inject(FormBuilder);
    form!: FormGroup;


    metricOptions: { label: string; value: string }[] = [
        { label: 'LSI Strength', value: 'lsi_strength' },
        { label: 'LSI Jump', value: 'lsi_jump' },
        { label: 'VAS Pain', value: 'vas_pain' },
        { label: 'ROM', value: 'rom' },
        { label: 'Edema', value: 'edema' },
    ];


    get phases(): Phase[] {
        return this.protocol()?.phases ?? [];
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            criteria: this.fb.array([
                this.buildRow('lsi_strength', 70),
                this.buildRow('vas_pain', 2),
            ]),
        });
    }

    addPhase(): void {
        this.protocolService.activeProtocol.update(proto => {
            if (!proto) return proto;
            const nextId = proto.phases.length + 1;
            const newPhase = this.protocolService.createPhase(nextId);
            return {
                ...proto,
                phases: [...proto.phases, newPhase]
            };
        });
    }

    removePhase(index: number): void {
        this.protocolService.activeProtocol.update(proto => {
            if (!proto || index <= 0) return proto;
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
            } else {
                targetPhase.measurementSessionNums = [...targetPhase.measurementSessionNums, sessionNum];
            }

            return { ...proto };
        });
    }

    isSessionSelected(phase: Phase, sessionNum: number): boolean {
        return phase.measurementSessionNums?.includes(sessionNum) ?? false;
    }

    private metricMeta: Record<string, { operator: '>=' | '<='; unit: string; defaultValue: number }> = {
        lsi_strength: { operator: '>=', unit: 'LSI %', defaultValue: 70 },
        lsi_jump: { operator: '>=', unit: 'LSI %', defaultValue: 80 },
        vas_pain: { operator: '<=', unit: '1-10', defaultValue: 2 },
        rom: { operator: '>=', unit: '°', defaultValue: 120 },
        edema: { operator: '<=', unit: 'cm', defaultValue: 1 },
    };

    get criteriaArray(): FormArray {
        return this.form.get('criteria') as FormArray;
    }

    get criteriaControls(): FormGroup[] {
        return this.criteriaArray.controls as FormGroup[];
    }

    private buildRow(metricValue: string, value: number): FormGroup {
        const meta = this.metricMeta[metricValue];
        return this.fb.group({
            metric: [metricValue, Validators.required],
            operator: [meta.operator],
            unit: [meta.unit],
            value: [value, [Validators.required, Validators.min(0)]],
        });
    }

    addCriterion(): void {
        this.criteriaArray.push(this.buildRow('lsi_strength', 70));
    }

    removeCriterion(index: number): void {
        this.criteriaArray.removeAt(index);
    }

    /** Call this when the metric dropdown changes to sync operator & unit */
    onMetricChange(index: number, metricValue: string): void {
        const meta = this.metricMeta[metricValue];
        if (!meta) return;
        const row = this.criteriaArray.at(index) as FormGroup;
        row.patchValue({ operator: meta.operator, unit: meta.unit, value: meta.defaultValue });
    }
}
