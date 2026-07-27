import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, catchError, startWith } from 'rxjs';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
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
import { SelectButtonModule } from 'primeng/selectbutton';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { ContactUsComponent } from '../contact-us/contact-us.component';
import { PatientFormService } from '../appointments/services/patient-form.service';
import { ServicesService } from '../add-service/services/services.service';

export type EntryType = 'new' | 'return' | 'reassess' | null;
export type FlowStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type PathChoice = 1 | 2 | 3 | null;
export type ReassessChoice = 'A' | 'B' | 'C' | 'D' | null;

interface Procedure {
    id: number;
    name: string;
    result?: string;
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
        RippleModule,
        SelectButtonModule,
        DropdownModule,
        TableModule,
        DialogModule,
        ProgressBarModule,
        ContactUsComponent
    ],
    templateUrl: './consultation-screen.component.html',
    styleUrl: './consultation-screen.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsultationScreenComponent {
    onsetDate: string = '';          // now bound to <input type="date">, stays a plain ISO string e.g. "2026-07-01"
    impactComment: string = '';      // new comment box under Impact on Performance

    // Step 3 — Impression & Findings
    generalImpressionNotes: string = '';
    purchaseInfluencer: string | null = null;

    // Step 4 — Judgment (Write Report branch)
    generalOpinion: string = '';
    // ── State ──────────────────────────────────────────────────────────────
    readonly entryType = signal<EntryType>(null);
    displayPatientInfoDialog = false;

    // ── Patient form — live signal from the shared PatientFormService ──────
    private readonly _patientFormService = inject(PatientFormService);
    /** Reactive alias: template uses mockPatientInfo() or mockPatientInfo directly */
    get mockPatientInfo() { return this._patientFormService.form(); }

    private readonly fb = inject(FormBuilder);
    private readonly servicesService = inject(ServicesService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    readonly purchaseInfluencerOptions = [
        { label: 'Athlete themself', value: 'self' },
        { label: 'Parent / Guardian', value: 'parent' },
        { label: 'Coach', value: 'coach' },
        { label: 'Club / Team', value: 'club' }
    ];

    constructor() {
        this.route.queryParams.subscribe(params => {
            if (params['type']) {
                this.selectEntry(params['type'] as EntryType);
            }
        });
    }

    backToDashboard(): void {
        this.router.navigate(['/uikit/doctor-control']);
    }

    // ── Services (Recommended Track) — loaded from /api/Serivces ───────────
    readonly servicesLoading = signal(true);
    readonly servicesError = signal<string | null>(null);

    private readonly _servicesRaw = toSignal(
        this.servicesService.getServices().pipe(
            map(data => { this.servicesLoading.set(false); return data; }),
            catchError(err => {
                this.servicesLoading.set(false);
                this.servicesError.set(err?.message ?? 'Failed to load services');
                return of([]);
            }),
            startWith([])
        ),
        { initialValue: [] }
    );

    readonly recommendedTrackOptions = computed(() =>
        (this._servicesRaw() ?? []).map(s => ({
            label: s.nameEn ?? s.nameAr ?? `Service ${s.id}`,
            value: s.id
        }))
    );

    /** Currently selected service id — drives the card-selection highlight. */
    get selectedServiceId(): number | null {
        return this.rehabForm.get('recommendedTrack')?.value as number | null;
    }

    selectService(id: number | undefined): void {
        if (id == null) return;
        this.rehabForm.get('recommendedTrack')?.setValue(id);
    }

    readonly priorityOptions = [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' }
    ];

    readonly durationOptions = [
        { label: '4 Weeks', value: '4' },
        { label: '6 Weeks', value: '6' },
        { label: '8 Weeks', value: '8' },
        { label: '12 Weeks', value: '12' },
        { label: 'Custom Program', value: 'custom' }
    ];

    readonly rehabForm = this.fb.group({
        recommendedTrack: [null as number | null],
        priorityLevel: ['medium'],
        programDuration: ['8'],
        customSessionsPerWeek: [3],
        phases: this.fb.array([
            this.fb.group({
                phaseName: ['Phase 1: Mobility & Control'],
                goal: ['Restore full range of motion'],
                transitionCriteria: ['ROM flexion > 120°'],
                sessions: [8]
            }),
            this.fb.group({
                phaseName: ['Phase 2: Strength & Load'],
                goal: ['Equalize limb strength'],
                transitionCriteria: ['LSI > 80%'],
                sessions: [12]
            })
        ]),
        sportsRecommendations: ['Resume light jogging after Phase 2, avoid contact sports until graduation.'],
        teamNotes: ['Monitor psychological status (Yellow Flag alert). Focus on quad control.']
    });

    get phasesArray(): FormArray {
        return this.rehabForm.get('phases') as FormArray;
    }

    addPhaseRow(): void {
        this.phasesArray.push(this.fb.group({
            phaseName: [''],
            goal: [''],
            transitionCriteria: [''],
            sessions: [6]
        }));
    }

    removePhaseRow(index: number): void {
        if (this.phasesArray.length > 1) {
            this.phasesArray.removeAt(index);
        }
    }


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
        if (t === 'return') return ['Validity', 'Examination', 'Assessment', 'Diagnosis', 'Athlete Report', 'Decision'];
        if (t === 'reassess') return ['Examination', 'Assessment', 'Diagnosis', 'Athlete Report', 'Decision', 'Action'];
        return ['Examination', 'Assessment', 'Diagnosis', 'Athlete Report', 'Decision', 'Action'];
    });

    // ── Examination form ────────────────────────────────────────────────────
    readonly procedures = signal<Procedure[]>([
        { id: 1, name: '' },
        { id: 2, name: '' }
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

    daysSinceOnset(): number | null {
        if (!this.onsetDate) return null;
        const start = new Date(this.onsetDate);
        if (isNaN(start.getTime())) return null;
        const diffMs = Date.now() - start.getTime();
        return Math.max(0, Math.floor(diffMs / 86400000));
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

        // Seed PatientFormService with mockup data matching the selected entry type
        if (type === 'new') {
            // this._patientFormService.form.set({
            //     fullName: 'Hani Salem',
            //     dateOfBirth: new Date('1998-05-15'),
            //     address: 'Cairo, Nasr City',
            //     gender: 'male',
            //     weight: 78,
            //     height: 182,
            //     phone: '01012345678',
            //     phoneConfirm: '01012345678',
            //     emergencyPhone: '01198765432',
            //     emergencyRelation: 'Brother',
            //     bookingForSelf: true,
            //     decisionInfluencers: ['self', 'coach'],
            //     sport: 'Football',
            //     position: 'Midfielder',
            //     club: 'Al Ahly',
            //     team: 'First Team',
            //     center: 'Cairo',
            //     role: 'Midfielder',
            //     practiceYears: 12,
            //     topAchievement: 'League Cup 2024',
            //     competitiveLevel: 'amateur',
            //     goal90Days: 'Return to full pitch training without pain',
            //     activityLevel: 'high',
            //     painLocations: 'Right knee',
            //     currentPain: 4,
            //     maxPain: 7,
            //     painEffectOnPerformance: 6,
            //     painEffectOnSport: 6,
            //     injuryDate: new Date('2026-04-10'),
            //     injuryDescription: 'Twisting knee while changing direction on turf',
            //     injuryCauses: 'Sudden direction change',
            //     timeOffFromSport: '3 weeks',
            //     injuryCircumstances: 'Twisting knee while changing direction on turf',
            //     injuryRelatedToSport: true,
            //     wasExamined: true,
            //     diagnosis: 'Grade II MCL Sprain',
            //     doctorName: 'Dr. Ahmed',
            //     doctorContactMethod: 'Clinic',
            //     procedureType: 'physio',
            //     diagnosticMethods: ['mri'],
            //     seenDoctor: true,
            //     previousTests: ['lab'],
            //     previousTreatment: ['physio', 'rest'],
            //     avoidMovements: true,
            //     chronicConditions: ['none'],
            //     familyHistory: ['none'],
            //     previousInjuries: [{ name: 'Ankle Sprain', date: '2023', description: 'Fully healed' }],
            //     surgeries: [{ type: 'None', part: 'None', year: 'None', notes: 'None' }],
            //     regularMedications: [{ name: 'None', dose: 'None', reason: 'None', notes: 'None' }],
            //     allergies: 'None',
            //     hasClientMedicalCondition: false,
            //     clientMedicalConditionDetails: '',
            //     hasParentsMedicalCondition: false,
            //     parentsMedicalConditionDetails: '',
            //     jobTitle: 'Accountant',
            //     workNature: 'مكتبي',
            //     dailySittingHours: 8,
            //     isMarried: false,
            //     hasChildren: false,
            //     habits: [],
            //     highWorkStress: false,
            //     sleepQuality: 'average',
            //     usesKinesio: true,
            //     recoveryExpectation: 8,
            //     dataConsent: true,
            //     consentFullName: 'Hani Salem',
            //     consentDate: new Date('2026-07-18'),
            //     performanceEngineer: 'Engineers team member',
            //     selectedMuscles: ['muscle 11', 'muscle 12']
            // });
        } else if (type === 'return') {
            // this._patientFormService.form.set({
            //     fullName: 'Omar Tarek',
            //     dateOfBirth: new Date('1994-08-22'),
            //     address: 'Giza, Dokki',
            //     gender: 'male',
            //     weight: 85,
            //     height: 178,
            //     phone: '01234567890',
            //     phoneConfirm: '01234567890',
            //     emergencyPhone: '01512345678',
            //     emergencyRelation: 'Wife',
            //     bookingForSelf: true,
            //     decisionInfluencers: ['self'],
            //     sport: 'Tennis',
            //     position: 'Singles Player',
            //     club: 'Gezira Sporting Club',
            //     team: 'Individual',
            //     center: 'Giza',
            //     role: 'Player',
            //     practiceYears: 15,
            //     topAchievement: 'National amateur champion 2022',
            //     competitiveLevel: 'professional',
            //     goal90Days: 'Serve at 100% velocity',
            //     activityLevel: 'high',
            //     painLocations: 'Right shoulder',
            //     currentPain: 3,
            //     maxPain: 6,
            //     painEffectOnPerformance: 5,
            //     painEffectOnSport: 5,
            //     injuryDate: new Date('2026-06-01'),
            //     injuryDescription: 'Overhead serve pain in shoulder',
            //     injuryCauses: 'Repetitive overhead motion',
            //     timeOffFromSport: '2 weeks',
            //     injuryCircumstances: 'Overhead serve pain in shoulder',
            //     injuryRelatedToSport: true,
            //     wasExamined: true,
            //     diagnosis: 'Rotator Cuff Tendinopathy',
            //     doctorName: 'Dr. Mona',
            //     doctorContactMethod: 'Online',
            //     procedureType: 'physio',
            //     diagnosticMethods: ['ultrasound'],
            //     seenDoctor: true,
            //     previousTests: ['none'],
            //     previousTreatment: ['physio', 'massage'],
            //     avoidMovements: true,
            //     chronicConditions: ['none'],
            //     familyHistory: ['none'],
            //     previousInjuries: [{ name: 'ACL Reconstruction', date: '2025', description: 'Successfully healed' }],
            //     surgeries: [{ type: 'ACL Reconstruction', part: 'Right Knee', year: '2025', notes: 'Successful recovery' }],
            //     regularMedications: [{ name: 'None', dose: 'None', reason: 'None', notes: 'None' }],
            //     allergies: 'None',
            //     hasClientMedicalCondition: false,
            //     clientMedicalConditionDetails: '',
            //     hasParentsMedicalCondition: false,
            //     parentsMedicalConditionDetails: '',
            //     jobTitle: 'Engineer',
            //     workNature: 'ميداني',
            //     dailySittingHours: 4,
            //     isMarried: true,
            //     hasChildren: true,
            //     habits: [],
            //     highWorkStress: true,
            //     sleepQuality: 'good',
            //     usesKinesio: false,
            //     recoveryExpectation: 9,
            //     dataConsent: true,
            //     consentFullName: 'Omar Tarek',
            //     consentDate: new Date('2026-07-19'),
            //     performanceEngineer: 'Lead Engineer',
            //     selectedMuscles: ['muscle 1', 'muscle 3']
            // });
        } else if (type === 'reassess') {
            // this._patientFormService.form.set({
            //     fullName: 'Karim Mahmoud',
            //     dateOfBirth: new Date('2001-11-03'),
            //     address: 'Giza, 6th of October',
            //     gender: 'male',
            //     weight: 92,
            //     height: 195,
            //     phone: '01011122233',
            //     phoneConfirm: '01011122233',
            //     emergencyPhone: '01133322211',
            //     emergencyRelation: 'Father',
            //     bookingForSelf: true,
            //     decisionInfluencers: ['self', 'coach', 'club'],
            //     sport: 'Basketball',
            //     position: 'Center',
            //     club: 'Zamalek',
            //     team: 'First Team',
            //     center: 'Giza',
            //     role: 'Center',
            //     practiceYears: 10,
            //     topAchievement: 'African Championship 2025',
            //     competitiveLevel: 'professional',
            //     goal90Days: 'Reassess shoulder pain and finalize ACL rehab phase 3',
            //     activityLevel: 'high',
            //     painLocations: 'Right shoulder and right knee',
            //     currentPain: 5,
            //     maxPain: 8,
            //     painEffectOnPerformance: 7,
            //     painEffectOnSport: 7,
            //     injuryDate: new Date('2026-07-15'),
            //     injuryDescription: 'Sudden shoulder stretch during defensive block',
            //     injuryCauses: 'Defensive block movement',
            //     timeOffFromSport: '1 week',
            //     injuryCircumstances: 'Sudden shoulder stretch during defensive block',
            //     injuryRelatedToSport: true,
            //     wasExamined: true,
            //     diagnosis: 'Rotator Cuff Strain + Active ACL rehab',
            //     doctorName: 'Dr. Samir',
            //     doctorContactMethod: 'Clinic',
            //     procedureType: 'rehabilitation',
            //     diagnosticMethods: ['mri', 'xray'],
            //     seenDoctor: true,
            //     previousTests: ['none'],
            //     previousTreatment: ['physio'],
            //     avoidMovements: true,
            //     chronicConditions: ['none'],
            //     familyHistory: ['none'],
            //     previousInjuries: [{ name: 'ACL Tear - Right Knee', date: '2026', description: 'Ongoing recovery' }],
            //     surgeries: [{ type: 'ACL Reconstruction', part: 'Right Knee', year: '2026', notes: 'Active recovery program' }],
            //     regularMedications: [{ name: 'None', dose: 'None', reason: 'None', notes: 'None' }],
            //     allergies: 'None',
            //     hasClientMedicalCondition: false,
            //     clientMedicalConditionDetails: '',
            //     hasParentsMedicalCondition: false,
            //     parentsMedicalConditionDetails: '',
            //     jobTitle: 'Athlete',
            //     workNature: 'ميداني',
            //     dailySittingHours: 2,
            //     isMarried: false,
            //     hasChildren: false,
            //     habits: [],
            //     highWorkStress: true,
            //     sleepQuality: 'poor',
            //     usesKinesio: true,
            //     recoveryExpectation: 7,
            //     dataConsent: true,
            //     consentFullName: 'Karim Mahmoud',
            //     consentDate: new Date('2026-07-19'),
            //     performanceEngineer: 'Ahmed Salem',
            //     selectedMuscles: ['muscle 3', 'muscle 12']
            // });
        } else {
            this._patientFormService.reset();
        }
    }

    startFlow(): void {
        this.flowStarted.set(true);
        this.currentStep.set(1);
    }

    go(step: any): void {
        this.currentStep.set(step);
    }

    addProcedure(): void {
        this.procedures.update(procs => [...procs, { id: this.nextProcId++, name: '' }]);
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

    judgmentChoice = signal<'writeReport' | 'extraAssessment' | null>(null);

    setJudgmentChoice(choice: 'writeReport' | 'extraAssessment'): void {
        this.judgmentChoice.set(choice);
    }

    // Mirrors the old getDecisionConfirmVisible(), but branches on judgmentChoice()
    getJudgmentConfirmVisible(): boolean {
        if (this.judgmentChoice() === 'writeReport') {
            return !!this.generalOpinion?.trim()
                && !!this.diagnosisText?.trim()
                && !!this.goalText?.trim();
        }
        if (this.judgmentChoice() === 'extraAssessment') {
            return this.entryType() === 'reassess'
                ? !!this.selectedReassessPath()
                : !!this.selectedPath();
        }
        return false;
    }






}

// ── Sidebar types ────────────────────────────────────────────────────────────
interface SidebarItem { color: string; text: string; }
interface SidebarData {
    title: string;
    items: SidebarItem[];
    history: SidebarItem[];
    ticketStatus: SidebarItem[];
    activeProtocol: { title: string; rows: { label: string; value: string }[] } | null;
}


