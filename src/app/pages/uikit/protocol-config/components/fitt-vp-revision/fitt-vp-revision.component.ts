import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ProtocolService } from '../../services/protocol.service';
import { Phase, Exercise, CertItem } from '../../models/protocol.model';

@Component({
    selector: 'app-fitt-vp-revision',
    imports: [CommonModule, FormsModule, CardModule, TagModule, ButtonModule, InputTextModule, DropdownModule, CheckboxModule],
    templateUrl: './fitt-vp-revision.component.html',
    styleUrl: './fitt-vp-revision.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FittVpRevisionComponent {
    private protocolService = inject(ProtocolService);
    readonly protocol = this.protocolService.activeProtocol;

    fittCards: any[] = [
        {
            letter: 'F',
            titleEn: 'Frequency',
            desc: '3 sessions / week – Documented in phase definition',
            status: 'Complete',
            badgeClass: 'badge-f',
            statusClass: 'status-complete'
        },
        {
            letter: 'I',
            titleEn: 'Intensity',
            desc: 'Intensity method documented for each exercise: kg / % 1RM / RPE / RIR',
            status: 'Complete',
            badgeClass: 'badge-i',
            statusClass: 'status-complete'
        },
        {
            letter: 'T',
            titleEn: 'Time',
            desc: 'Part duration + rest between sets + tempo',
            status: 'Complete',
            badgeClass: 'badge-t',
            statusClass: 'status-complete'
        },
        {
            letter: 'T',
            titleEn: 'Type',
            desc: 'Name + tool + contraction type (Concentric / Eccentric / Isometric)',
            status: 'Complete',
            badgeClass: 'badge-t2',
            statusClass: 'status-complete'
        },
        {
            letter: 'V',
            titleEn: 'Volume',
            desc: 'Calculated automatically = ∑ (Sets × Reps × Load) Volume Load',
            status: 'Complete – Auto',
            badgeClass: 'badge-v',
            statusClass: 'status-complete'
        },
        {
            letter: 'P',
            titleEn: 'Progression',
            desc: 'Progression rule documented: Type + Increment + Trigger Condition',
            status: 'Complete',
            badgeClass: 'badge-p',
            statusClass: 'status-complete'
        }
    ];

    certItems: any[] = [
        { tag: 'CERT #1', label: 'Equipment and materials required for the exercise', checked: true },
        { tag: 'CERT #2', label: 'Qualifications and experience of the provider', checked: true },
        { tag: 'CERT #3', label: 'Detailed description of how to perform the exercise', checked: true },
        { tag: 'CERT #13', label: 'Dosage – Sets, repetitions, and duration', checked: true },
        { tag: 'CERT #14-15', label: 'Method of progression and individualization', checked: true },
        { tag: 'CERT #3', label: 'Contraindications and stop signals', checked: true },
        { tag: 'CERT #14', label: 'Criteria for transition between phases (Criteria-Based)', checked: true },
        { tag: 'CERT #3', label: 'Link to video demonstration of the exercise', checked: true }
    ];

    get phases(): Phase[] {
        return this.protocol()?.phases ?? [];
    }

    getAllExercises(phase: Phase): { sessionNum: number; sectionTitle: string; exercise: Exercise }[] {
        const result: { sessionNum: number; sectionTitle: string; exercise: Exercise }[] = [];
        for (const week of phase.weeks) {
            for (const session of week.sessions) {
                for (const section of session.sections) {
                    for (const ex of section.exercises) {
                        result.push({
                            sessionNum: session.sessionNumber,
                            sectionTitle: section.sectionName,
                            exercise: ex
                        });
                    }
                }
            }
        }
        return result;
    }
}
