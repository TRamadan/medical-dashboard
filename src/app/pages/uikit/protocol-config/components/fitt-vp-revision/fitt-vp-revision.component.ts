import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { ProtocolService } from '../../services/protocol.service';
import { Phase, Exercise, ExerciseType, ManualType } from '../../models/protocol.model';

export interface FittCard {
    letter: string;
    titleEn: string;
    desc: string;
    badgeClass: string;
    complete: boolean;
    missingItems: string[];
}

@Component({
    selector: 'app-fitt-vp-revision',
    imports: [CommonModule, FormsModule, CardModule, TagModule, ButtonModule,
        InputTextModule, DropdownModule, CheckboxModule, TooltipModule],
    templateUrl: './fitt-vp-revision.component.html',
    styleUrl: './fitt-vp-revision.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FittVpRevisionComponent {
    private protocolService = inject(ProtocolService);
    readonly protocol = this.protocolService.activeProtocol;

    // ── Computed validation ────────────────────────────────────────────────────
    // Reads both activeProtocol AND protocolRevision so it re-runs whenever
    // either signal changes — including when ngModel mutates nested objects
    // and the host component calls protocolService.notifyChange().
    readonly fittCards = computed<FittCard[]>(() => {
        // Declare dependency on the revision counter so mutations trigger re-evaluation
        this.protocolService.protocolRevision();

        const proto = this.protocol();
        const phases = proto?.phases ?? [];

        return [
            this.buildFrequencyCard(phases),
            this.buildIntensityCard(phases),
            this.buildTimeCard(phases),
            this.buildTypeCard(phases),
            this.buildVolumeCard(phases),
            this.buildProgressionCard(phases),
        ];
    });

    // ── Shared guard: collect all exercises across all phases ─────────────────
    private collectAllExercises(phases: Phase[]): {
        phase: Phase;
        sessionNum: number;
        sectionName: string;
        ex: Exercise;
    }[] {
        const all: { phase: Phase; sessionNum: number; sectionName: string; ex: Exercise }[] = [];
        for (const phase of phases) {
            for (const week of phase.weeks) {
                for (const session of week.sessions) {
                    for (const section of session.sections) {
                        for (const ex of section.exercises) {
                            all.push({ phase, sessionNum: session.sessionNumber, sectionName: section.sectionName, ex });
                        }
                    }
                }
            }
        }
        return all;
    }

    // ── F – Frequency ─────────────────────────────────────────────────────────
    private buildFrequencyCard(phases: Phase[]): FittCard {
        const missing: string[] = [];

        if (phases.length === 0) {
            missing.push('No phases defined yet — add at least one phase with sessions/week');
        } else {
            phases.forEach(phase => {
                const spw = Number(phase.sessionsPerWeek);
                if (!spw || spw < 1) {
                    missing.push(`Phase "${phase.name}": sessions/week not defined`);
                }
            });
        }

        return {
            letter: 'F',
            titleEn: 'Frequency',
            desc: 'Sessions / week – documented in each phase definition',
            badgeClass: 'badge-f',
            complete: missing.length === 0,
            missingItems: missing,
        };
    }

    // ── I – Intensity ─────────────────────────────────────────────────────────
    private buildIntensityCard(phases: Phase[]): FittCard {
        const missing: string[] = [];
        const allExercises = this.collectAllExercises(phases);

        if (allExercises.length === 0) {
            missing.push('No exercises defined yet — add exercises to sessions first');
        } else {
            for (const { phase, sessionNum, ex } of allExercises) {
                if (ex.type !== 'exercise') continue;
                const exT = ex as ExerciseType;
                const label = `Phase "${phase.name}" › Session ${sessionNum} › "${ex.name || 'Unnamed exercise'}"`;

                if (!exT.intensityMethod?.trim()) {
                    missing.push(`${label}: intensity method not set`);
                } else {
                    const missingIntensity = exT.sets.some(s => !s.intensity?.trim());
                    if (missingIntensity) {
                        missing.push(`${label}: one or more set intensity values are empty`);
                    }
                }
            }
        }

        return {
            letter: 'I',
            titleEn: 'Intensity',
            desc: 'Intensity method + per-set intensity value for each exercise',
            badgeClass: 'badge-i',
            complete: missing.length === 0,
            missingItems: missing,
        };
    }

    // ── T – Time ──────────────────────────────────────────────────────────────
    private buildTimeCard(phases: Phase[]): FittCard {
        const missing: string[] = [];

        if (phases.length === 0) {
            missing.push('No phases defined yet — section duration and tempo cannot be validated');
        } else {
            let exerciseCount = 0;
            for (const phase of phases) {
                for (const week of phase.weeks) {
                    for (const session of week.sessions) {
                        for (const section of session.sections) {
                            if (!section.time?.trim()) {
                                missing.push(
                                    `Phase "${phase.name}" › Session ${session.sessionNumber} › Section "${section.sectionName || 'Unnamed'}": duration (time) not set`
                                );
                            }
                            for (const ex of section.exercises) {
                                exerciseCount++;
                                if (ex.type !== 'exercise') continue;
                                const exT = ex as ExerciseType;
                                const label = `Phase "${phase.name}" › Session ${session.sessionNumber} › "${ex.name || 'Unnamed exercise'}"`;
                                if (exT.sets.some(s => !s.tempo?.trim())) {
                                    missing.push(`${label}: one or more set tempos are empty`);
                                }
                                if (exT.sets.some(s => !s.rest?.toString().trim())) {
                                    missing.push(`${label}: one or more rest values are empty`);
                                }
                            }
                        }
                    }
                }
            }
            if (exerciseCount === 0) {
                missing.push('No exercises defined yet — add exercises to validate time fields');
            }
        }

        return {
            letter: 'T',
            titleEn: 'Time',
            desc: 'Part duration + rest between sets + tempo per set',
            badgeClass: 'badge-t',
            complete: missing.length === 0,
            missingItems: missing,
        };
    }

    // ── T – Type ──────────────────────────────────────────────────────────────
    private buildTypeCard(phases: Phase[]): FittCard {
        const missing: string[] = [];
        const allExercises = this.collectAllExercises(phases);

        if (allExercises.length === 0) {
            missing.push('No exercises defined yet — add exercises to sessions first');
        } else {
            for (const { phase, sessionNum, sectionName, ex } of allExercises) {
                const label = `Phase "${phase.name}" › Session ${sessionNum}`;
                if (!ex.name?.trim()) {
                    missing.push(`${label} › Section "${sectionName || 'Unnamed'}": exercise name not set`);
                }
                if (ex.type === 'exercise') {
                    const exT = ex as ExerciseType;
                    if (!exT.equipment?.trim()) {
                        missing.push(`${label} › "${ex.name || 'Unnamed'}": equipment (tool) not set`);
                    }
                    if (!exT.contractionType?.trim()) {
                        missing.push(`${label} › "${ex.name || 'Unnamed'}": contraction type not set`);
                    }
                }
            }
        }

        return {
            letter: 'T',
            titleEn: 'Type',
            desc: 'Name + tool + contraction type (Concentric / Eccentric / Isometric)',
            badgeClass: 'badge-t2',
            complete: missing.length === 0,
            missingItems: missing,
        };
    }

    // ── V – Volume (auto-calculated, always informational) ────────────────────
    private buildVolumeCard(_phases: Phase[]): FittCard {
        return {
            letter: 'V',
            titleEn: 'Volume',
            desc: 'Calculated automatically = ∑ (Sets × Reps × Load) Volume Load',
            badgeClass: 'badge-v',
            complete: true,
            missingItems: [],
        };
    }

    // ── P – Progression ───────────────────────────────────────────────────────
    private buildProgressionCard(phases: Phase[]): FittCard {
        const missing: string[] = [];
        const allExercises = this.collectAllExercises(phases);

        if (allExercises.length === 0) {
            missing.push('No exercises defined yet — add exercises to sessions first');
        } else {
            for (const { phase, sessionNum, ex } of allExercises) {
                const label = `Phase "${phase.name}" › Session ${sessionNum} › "${ex.name || 'Unnamed exercise'}"`;
                const pr = ex.progressionRule;
                if (!pr) {
                    missing.push(`${label}: no progression rule defined`);
                } else {
                    if (!pr.title?.trim()) {
                        missing.push(`${label}: progression type (title) is empty`);
                    }
                    if (pr.incrementAmount === null || pr.incrementAmount === undefined || String(pr.incrementAmount).trim() === '') {
                        missing.push(`${label}: increment amount not set`);
                    }
                    if (!pr.progressionCondition?.trim()) {
                        missing.push(`${label}: trigger condition is empty`);
                    }
                }
            }
        }

        return {
            letter: 'P',
            titleEn: 'Progression',
            desc: 'Progression rule per exercise: Type + Increment + Trigger Condition',
            badgeClass: 'badge-p',
            complete: missing.length === 0,
            missingItems: missing,
        };
    }

    // ── CERT items ────────────────────────────────────────────────────────────
    // ── CERT Items (Reactive Validation) ──────────────────────────────────────
    readonly certItems = computed(() => {
        this.protocolService.protocolRevision();
        const proto = this.protocol();
        if (!proto) return [];

        const phases = proto.phases ?? [];
        const allExercises = this.collectAllExercises(phases);
        const hasManualExercise = allExercises.some(e => e.ex.type === 'manual');

        const items = [
            {
                tag: 'CERT #1',
                label: 'Equipment and materials required for the exercise',
                checked: allExercises.length > 0 && allExercises.every(e => {
                    if (e.ex.type !== 'exercise') return true;
                    return (e.ex as ExerciseType).equipment?.trim().length > 0;
                })
            },
            {
                tag: 'CERT #2',
                label: 'Qualifications and experience of the provider',
                checked: !!proto.createdBy?.name?.trim() && !!proto.createdBy?.role?.trim()
            },
            {
                tag: 'CERT #3',
                label: 'Detailed description of how to perform the exercise',
                checked: allExercises.length > 0 && allExercises.every(e => e.ex.description?.trim().length > 0)
            },
            {
                tag: 'CERT #13',
                label: 'Dosage – Sets, repetitions, and duration',
                checked: allExercises.length > 0 && allExercises.every(e => {
                    if (e.ex.type !== 'exercise') return true;
                    const exT = e.ex as ExerciseType;
                    const hasSets = exT.sets.length > 0;
                    const setsFilled = exT.sets.every(s => s.repetitions > 0);
                    // Check if the section containing this exercise has time
                    const phase = phases.find(p => p.weeks.some(w => w.sessions.some(s => s.sessionNumber === e.sessionNum)));
                    const session = phase?.weeks.flatMap(w => w.sessions).find(s => s.sessionNumber === e.sessionNum);
                    const section = session?.sections.find(s => s.sectionName === e.sectionName);
                    const timeFilled = !!section?.time?.trim();
                    return hasSets && setsFilled && timeFilled;
                })
            },
            {
                tag: 'CERT #14-15',
                label: 'Method of progression and individualization',
                checked: allExercises.length > 0 && allExercises.every(e => {
                    const pr = e.ex.progressionRule;
                    return !!pr?.title?.trim() && (pr?.incrementAmount !== null && pr?.incrementAmount !== undefined) && !!pr?.progressionCondition?.trim();
                })
            },
            {
                tag: 'CERT #3',
                label: 'Contraindications and stop signals',
                checked: phases.length > 0 && phases.every(p => p.criteria?.precautions?.trim().length > 0)
            },
            {
                tag: 'CERT #14',
                label: 'Criteria for transition between phases (Criteria-Based)',
                checked: phases.length > 0 && phases.every(p => p.criteria?.transitionCriteria?.length > 0)
            }
        ];

        // Add Video Link item only if there's a manual exercise
        if (hasManualExercise) {
            items.push({
                tag: 'CERT #3',
                label: 'Link to video demonstration of the exercise',
                checked: allExercises.filter(e => e.ex.type === 'manual').every((e: any) => (e.ex as ManualType).videoUrl?.trim().length > 0)
            });
        }

        return items;
    });

    getAllExercises(phase: Phase): { sessionNum: number; sectionTitle: string; exercise: Exercise }[] {
        const result: { sessionNum: number; sectionTitle: string; exercise: Exercise }[] = [];
        for (const week of phase.weeks) {
            for (const session of week.sessions) {
                for (const section of session.sections) {
                    for (const ex of section.exercises) {
                        result.push({ sessionNum: session.sessionNumber, sectionTitle: section.sectionName, exercise: ex });
                    }
                }
            }
        }
        return result;
    }
}
