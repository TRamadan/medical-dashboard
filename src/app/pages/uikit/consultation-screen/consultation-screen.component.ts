import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';

export type EntryType = 'new' | 'return' | 'reassess' | null;
export type FlowStep = 0 | 1 | 2 | 3 | 4 | 5;
export type PathChoice = 1 | 2 | 3 | null;
export type ReassessChoice = 'A' | 'B' | 'C' | 'D' | null;

interface Procedure {
    id: number;
    text: string;
}

interface AthleteInfo {
    name: string;
    initials: string;
    meta: string;
}

@Component({
    selector: 'app-consultation-screen',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        CardModule,
        InputTextModule,
        InputNumberModule,
        SelectModule,
        TextareaModule,
        TagModule,
        DividerModule,
        TooltipModule,
        BadgeModule,
        RippleModule
    ],
    templateUrl: './consultation-screen.component.html',
    styleUrl: './consultation-screen.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsultationScreenComponent {

    // ── State ──────────────────────────────────────────────────────────────
    readonly entryType = signal<EntryType>(null);
    readonly currentStep = signal<FlowStep>(0);
    readonly selectedPath = signal<PathChoice>(null);
    readonly selectedReassessPath = signal<ReassessChoice>(null);
    readonly flowStarted = signal(false);
    readonly actionDone = signal(false);

    // ── Athlete data ────────────────────────────────────────────────────────
    readonly athleteInfo = computed<AthleteInfo | null>(() => {
        const t = this.entryType();
        if (!t) return null;
        const map: Record<string, AthleteInfo> = {
            new: { name: 'Hani Salem', initials: 'HS', meta: 'Male · 28 yrs · Football · Right Knee Pain' },
            return: { name: 'Omar Tarek', initials: 'OT', meta: 'Male · 32 yrs · Graduated Mar 2026 · New Shoulder Pain' },
            reassess: { name: 'Karim Mahmoud', initials: 'KM', meta: 'Male · 25 yrs · Active ACL Program · Phase 3 · New Shoulder Injury' }
        };
        return map[t];
    });

    readonly entryBadge = computed(() => {
        const t = this.entryType();
        if (!t) return null;
        const map: Record<string, { label: string; severity: 'success' | 'warn' | 'danger' }> = {
            new: { label: 'New Athlete', severity: 'success' },
            return: { label: 'Returning Athlete', severity: 'warn' },
            reassess: { label: 'Reassessment', severity: 'danger' }
        };
        return map[t];
    });

    // ── Step label per flow ─────────────────────────────────────────────────
    readonly stepLabels = computed(() => {
        const t = this.entryType();
        if (t === 'return') return ['Validity', 'Examination', 'Assessment', 'Diagnosis', 'Decision'];
        if (t === 'reassess') return ['Examination', 'Assessment', 'Diagnosis', 'Decision', 'Action'];
        return ['Examination', 'Assessment', 'Diagnosis', 'Decision', 'Action'];
    });

    // ── Examination form ────────────────────────────────────────────────────
    readonly procedures = signal<Procedure[]>([
        { id: 1, text: '' },
        { id: 2, text: '' }
    ]);
    nextProcId = 3;

    vasPain: number | null = null;
    romFlexion: string = '';
    romExtension: string = '';
    quadLsi: string = '';
    effusion: string = 'None';
    asymmetry: string = '';

    readonly effusionOptions = [
        { label: 'None', value: 'None' },
        { label: 'Trace', value: 'Trace' },
        { label: 'Mild', value: 'Mild' },
        { label: 'Moderate', value: 'Moderate' }
    ];

    // ── Clinical Assessment (Step 2 — Doctor Form) ─────────────────────────
    // Complaint
    complaintWords: string = '';
    impactTraining: string = '';
    impactCompetition: string = '';
    impactDaily: string = '';
    onsetDate: string = '';
    aggravating: string = '';

    // Clinical Findings
    findingsMain: string = '';
    findingsStrengths: string = '';
    findingsWeaknesses: string = '';

    // Yellow Flag Score
    readonly yfFlags = signal<boolean[]>([false, false, false, false, false]);
    readonly yfScore = computed(() => this.yfFlags().filter(Boolean).length);
    readonly yfAlert = computed(() => this.yfScore() >= 3);

    readonly yfItems = [
        { label: 'Chronic fear of movement (Kinesiophobia)', sub: 'Avoids movements out of clear fear of pain' },
        { label: 'Very low recovery expectation (≤ 3/10)', sub: 'Athlete does not believe improvement is possible' },
        { label: 'High psychological / social stress', sub: 'Work / relationships / external pressure visible' },
        { label: 'Negative experience with previous treatment', sub: 'Disappointment / low trust in therapy' },
        { label: 'Catastrophizing behaviour', sub: 'Exaggerates pain or expects worst outcomes' }
    ];

    toggleYfFlag(index: number): void {
        this.yfFlags.update(flags => {
            const copy = [...flags];
            copy[index] = !copy[index];
            return copy;
        });
    }

    // Behavioral Signals (Internal Only)
    emotionalTrigger: string = '';
    prevProvider: string = '';
    fears: string = '';
    compliance: string = '';
    persona: string = '';
    behavioralNotes: string = '';

    readonly complianceOptions = [
        { label: 'High — enthusiastic and committed', value: 'high' },
        { label: 'Medium — needs motivation', value: 'medium' },
        { label: 'Low — needs intensive follow-up', value: 'low' }
    ];
    readonly personaOptions = [
        { label: 'Not specified', value: '' },
        { label: 'Champion — committed professional', value: 'champion' },
        { label: 'Skeptic — hesitant, needs proof', value: 'skeptic' },
        { label: 'Anxious — worried, needs reassurance', value: 'anxious' },
        { label: 'Passive — inactive, needs activation', value: 'passive' },
        { label: 'VIP — returning with excellent experience', value: 'vip' }
    ];
    readonly impactOptions = [
        { label: 'No impact', value: '0' },
        { label: 'Partial impact', value: '1' },
        { label: 'Completely prevents me', value: '2' }
    ];

    // ── Diagnosis form ──────────────────────────────────────────────────────
    diagnosisText: string = '';
    diagnosisGrade: string = 'Grade I';
    diagnosisPhase: string = 'Acute';
    clinicalNotes: string = '';
    goalText: string = '';
    expectedDuration: string = '';
    goalType: string = 'Return to Play';

    readonly gradeOptions = [
        { label: 'Grade I', value: 'Grade I' },
        { label: 'Grade II', value: 'Grade II' },
        { label: 'Grade III', value: 'Grade III' }
    ];
    readonly phaseOptions = [
        { label: 'Acute', value: 'Acute' },
        { label: 'Sub-Acute', value: 'Sub-Acute' },
        { label: 'Chronic', value: 'Chronic' }
    ];
    readonly goalTypeOptions = [
        { label: 'Return to Play', value: 'Return to Play' },
        { label: 'Prevention', value: 'Prevention' },
        { label: 'Peak Performance', value: 'Peak Performance' },
        { label: 'Recharger', value: 'Recharger' }
    ];

    // ── Measurement path detail fields ──────────────────────────────────────
    measurementType: string = 'Force Plate';
    measurementDate: string = '';
    readonly measurementTypeOptions = [
        { label: 'Force Plate', value: 'Force Plate' },
        { label: 'Isokinetic', value: 'Isokinetic' },
        { label: 'VBT', value: 'VBT' }
    ];

    // ── Referral path detail fields ─────────────────────────────────────────
    referralTest: string = 'MRI';
    referralRegion: string = '';
    readonly referralTestOptions = [
        { label: 'MRI', value: 'MRI' },
        { label: 'X-Ray', value: 'X-Ray' },
        { label: 'CT', value: 'CT' },
        { label: 'Blood Tests', value: 'Blood Tests' }
    ];

    // ── Pause reason fields ─────────────────────────────────────────────────
    pauseReason: string = '';
    investigationType: string = 'Internal Measurements';
    pauseDuration: string = 'Two Weeks';
    readonly investigationTypeOptions = [
        { label: 'Internal Measurements', value: 'Internal Measurements' },
        { label: 'External Referral (MRI/X-Ray)', value: 'External Referral (MRI/X-Ray)' },
        { label: 'Specialist Consultation', value: 'Specialist Consultation' }
    ];
    readonly pauseDurationOptions = [
        { label: 'One Week', value: 'One Week' },
        { label: 'Two Weeks', value: 'Two Weeks' },
        { label: 'One Month', value: 'One Month' },
        { label: 'Undetermined', value: 'Undetermined' }
    ];

    // ── Derived / helpers ────────────────────────────────────────────────────
    readonly sidebarData = computed(() => {
        const t = this.entryType();
        if (!t) return null;
        const map: Record<string, SidebarData> = {
            new: {
                title: 'Athlete Summary',
                items: [
                    { color: '#EEEEF8', text: 'Hani Salem · 28 yrs' },
                    { color: '#3DD9A0', text: 'Football — Active Amateur' },
                    { color: '#FC6B44', text: 'Right knee pain · 3 months' }
                ],
                history: [
                    { color: '#E24B4A', text: 'Ankle sprain 2023 (healed)' },
                    { color: '#7A7FA8', text: 'No chronic illness · No medications' }
                ],
                ticketStatus: [
                    { color: '#3DD9A0', text: 'Data Map complete ✓' },
                    { color: '#3DD9A0', text: 'Payment confirmed ✓ — 4,000 EGP' }
                ],
                note: { title: 'Admin Note', text: '"Concerned about cost — explain value with data."' },
                activeProtocol: null
            },
            return: {
                title: 'Athlete Summary — Returning',
                items: [
                    { color: '#C9A84C', text: 'Omar Tarek · 32 yrs · Graduated' },
                    { color: '#3DD9A0', text: 'Previous Program: ACL RTP — Grad Mar 2026' },
                    { color: '#FC6B44', text: 'New Complaint: Right Shoulder Pain' }
                ],
                history: [
                    { color: '#3DD9A0', text: 'ACL Reconstruction — 24 weeks' },
                    { color: '#3DD9A0', text: 'Adherence 94% · NPS 9.2 · Excellent result' },
                    { color: '#3DD9A0', text: 'LSI at graduation: 92%' }
                ],
                ticketStatus: [
                    { color: '#C9A84C', text: 'Total paid previously: 13,000 EGP' },
                    { color: '#3DD9A0', text: 'Data Map valid until Jan 2027' }
                ],
                note: { title: 'System Note', text: '"Previous athlete with excellent experience. Blueprint valid — no re-entry needed. Treat as Returning VIP."' },
                activeProtocol: null
            },
            reassess: {
                title: 'Athlete — Active Program',
                items: [
                    { color: '#FC6B44', text: 'Karim Mahmoud · 25 yrs' },
                    { color: '#3DD9A0', text: 'Basketball — Professional' },
                    { color: '#FC6B44', text: 'New complaint: Right shoulder pain during passing' }
                ],
                history: [
                    { color: '#E24B4A', text: 'ACL Reconstruction — Jan 2026' },
                    { color: '#7A7FA8', text: 'No chronic illness' }
                ],
                ticketStatus: [],
                note: { title: 'Last Session', text: '"Yesterday — Engineer noticed shoulder pain during chest press. Athlete mentioned it for the first time."' },
                activeProtocol: {
                    title: 'ACL Return to Play — Active',
                    rows: [
                        { label: 'Phase', value: '3 of 5 — Strength' },
                        { label: 'Sessions', value: '18 of 36 completed' },
                        { label: 'Completion', value: '50%' },
                        { label: 'Lead', value: 'Ahmed Salem' },
                        { label: 'Engineers', value: 'R: Sara · S: Karim · A: Mohamed' },
                        { label: 'Phase Criteria', value: '2 of 4 achieved' }
                    ]
                }
            }
        };
        return map[t] ?? null;
    });

    // ── Actions ──────────────────────────────────────────────────────────────
    selectEntry(type: EntryType): void {
        this.entryType.set(type);
        this.currentStep.set(0);
        this.flowStarted.set(false);
        this.selectedPath.set(null);
        this.selectedReassessPath.set(null);
        this.actionDone.set(false);
    }

    startFlow(): void {
        this.flowStarted.set(true);
        this.currentStep.set(1);
    }

    go(step: any): void {
        this.currentStep.set(step);
    }

    addProcedure(): void {
        this.procedures.update(procs => [...procs, { id: this.nextProcId++, text: '' }]);
    }

    updateProcedure(id: number, text: string): void {
        this.procedures.update(procs => procs.map(p => p.id === id ? { ...p, text } : p));
    }

    removeProcedure(id: number): void {
        this.procedures.update(procs => procs.filter(p => p.id !== id));
    }

    pickPath(path: PathChoice): void {
        this.selectedPath.set(path);
    }

    pickReassessPath(letter: ReassessChoice): void {
        this.selectedReassessPath.set(letter);
    }

    confirmAction(): void {
        this.actionDone.set(true);
    }

    isStepCompleted(step: number): boolean {
        return step < this.currentStep();
    }

    isStepActive(step: number): boolean {
        return step === this.currentStep();
    }

    getDecisionConfirmVisible(): boolean {
        const t = this.entryType();
        if (t === 'reassess') return this.selectedReassessPath() !== null;
        return this.selectedPath() !== null;
    }

    trackById(_: number, item: Procedure): number {
        return item.id;
    }
}

// ── Sidebar types ────────────────────────────────────────────────────────────
interface SidebarItem { color: string; text: string; }
interface SidebarData {
    title: string;
    items: SidebarItem[];
    history: SidebarItem[];
    ticketStatus: SidebarItem[];
    note: { title: string; text: string };
    activeProtocol: { title: string; rows: { label: string; value: string }[] } | null;
}
