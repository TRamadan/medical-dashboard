import {
    Component,
    ChangeDetectionStrategy,
    signal,
    inject,
    input,
    model,
    effect,
    untracked
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { MuscleSkeletonViewerComponent } from '../../../appointments/muscle-skeleton-viewer/muscle-skeleton-viewer.component';
import { PatientFormService } from '../../../appointments/services/patient-form.service';
import {
    QuestionnaireAnswers,
    VisitObjective,
    ProblemDuration,
    ReferralSource
} from '../../../../../intake-form/models/questionair.model';

export interface PreAppointmentQuestionnaire {
    objective: VisitObjective | number;
    objectiveOther?: string | null;
    sport?: string | null;
    duration: ProblemDuration | number;
    hasPreviousTreatment: boolean;
    referralSource: ReferralSource | number;
    referralSourceOther?: string | null;
}

export interface PreAppointmentQuestionnaireView {
    objective: VisitObjective | number;
    objectiveLabel: string;
    objectiveOther?: string | null;
    sport?: string | null;
    duration: ProblemDuration | number;
    durationLabel: string;
    hasPreviousTreatment: boolean;
    referralSource: ReferralSource | number;
    referralSourceLabel: string;
    referralSourceOther?: string | null;
}

export const VISIT_OBJECTIVE_LABELS: Record<number, string> = {
    [VisitObjective.ReturnToSports]: 'العودة للرياضة',
    [VisitObjective.ChronicPain]: 'ألم مزمن',
    [VisitObjective.ImprovedPerformance]: 'رفع الأداء',
    [VisitObjective.Prevention]: 'الوقاية',
    [VisitObjective.Other]: 'أخرى'
};

export const PROBLEM_DURATION_LABELS: Record<number, string> = {
    [ProblemDuration.LessThan2Weeks]: 'أقل من أسبوعين',
    [ProblemDuration.TwoWeeksToMonth]: 'أسبوعين - شهر',
    [ProblemDuration.OneToThreeMonths]: '1 - 3 أشهر',
    [ProblemDuration.MoreThan3Months]: 'أكثر من 3 أشهر',
    [ProblemDuration.NoProblem]: 'لا توجد إصابة'
};

export const REFERRAL_SOURCE_LABELS: Record<number, string> = {
    [ReferralSource.Instagram]: 'انستجرام',
    [ReferralSource.Facebook]: 'فيسبوك',
    [ReferralSource.TikTok]: 'تيك توك',
    [ReferralSource.Friend]: 'صديق',
    [ReferralSource.Doctor]: 'توصية طبيب',
    [ReferralSource.Google]: 'جوجل',
    [ReferralSource.Other]: 'أخرى'
};

export function mapQuestionnaireForView(
    data: PreAppointmentQuestionnaire | null | undefined
): PreAppointmentQuestionnaireView | null {
    if (!data) return null;

    const objectiveNum = Number(data.objective);
    let objectiveLabel = VISIT_OBJECTIVE_LABELS[objectiveNum] || 'غير محدد';
    if (objectiveNum === VisitObjective.Other && data.objectiveOther) {
        objectiveLabel = `أخرى (${data.objectiveOther})`;
    } else if (data.objectiveOther && !VISIT_OBJECTIVE_LABELS[objectiveNum]) {
        objectiveLabel = data.objectiveOther;
    }

    const durationNum = Number(data.duration);
    const durationLabel = PROBLEM_DURATION_LABELS[durationNum] || 'غير محدد';

    const referralNum = Number(data.referralSource);
    let referralSourceLabel = REFERRAL_SOURCE_LABELS[referralNum] || 'غير محدد';
    if (referralNum === ReferralSource.Other && data.referralSourceOther) {
        referralSourceLabel = `أخرى (${data.referralSourceOther})`;
    } else if (data.referralSourceOther && !REFERRAL_SOURCE_LABELS[referralNum]) {
        referralSourceLabel = data.referralSourceOther;
    }

    return {
        objective: data.objective,
        objectiveLabel,
        objectiveOther: data.objectiveOther ?? null,
        sport: data.sport ?? null,
        duration: data.duration,
        durationLabel,
        hasPreviousTreatment: !!data.hasPreviousTreatment,
        referralSource: data.referralSource,
        referralSourceLabel,
        referralSourceOther: data.referralSourceOther ?? null
    };
}

@Component({
    selector: 'app-patient-dossier-dialog',
    imports: [CommonModule, DialogModule, DatePipe, MuscleSkeletonViewerComponent],
    templateUrl: './patient-dossier-dialog.component.html',
    styleUrl: './patient-dossier-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientDossierDialogComponent {
    private readonly patientFormService = inject(PatientFormService);

    // Two-way binding for dialog visibility
    readonly visible = model<boolean>(false);

    // Appointment ID to load profile for
    readonly appointmentId = input<number | null>(null);

    // Optional sidebar data
    readonly sidebarData = input<any>(null);

    // Optional preAppointmentQuestionnaire passed directly
    readonly preAppointmentQuestionnaire = input<PreAppointmentQuestionnaire | null>(null);

    // State
    readonly patientProfileLoading = signal(false);
    readonly patientProfileError = signal<string | null>(null);
    readonly rawPatientProfile = signal<any>(null);

    private lastLoadedAppointmentId: number | null = null;

    constructor() {
        effect(() => {
            const isVisible = this.visible();
            const apptId = this.appointmentId();

            if (isVisible && apptId != null) {
                if (apptId !== this.lastLoadedAppointmentId || !this.rawPatientProfile()) {
                    untracked(() => {
                        this.loadPatientProfile(apptId);
                    });
                }
            }
        });
    }

    loadPatientProfile(appointmentId: number): void {
        this.lastLoadedAppointmentId = appointmentId;
        this.patientProfileLoading.set(true);
        this.patientProfileError.set(null);
        this.patientFormService.getConsultationProfile(appointmentId).subscribe({
            next: (res) => {
                this.patientProfileLoading.set(false);
                if (res && res.data) {
                    this.rawPatientProfile.set(res.data);
                } else if (res) {
                    this.rawPatientProfile.set(res);
                }
            },
            error: () => {
                this.patientProfileLoading.set(false);
                this.patientProfileError.set('فشل تحميل بيانات الملف الشخصي للمريض');
            }
        });
    }

    get patientInfo() {
        const form = this.patientFormService.form();
        const raw = this.rawPatientProfile() || {};

        const fullName = form.personalData?.fullName || '';
        const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
        const initials = nameParts.length >= 2
            ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
            : nameParts[0] ? nameParts[0][0].toUpperCase() : '—';

        let age: number | null = null;
        if (form.personalData?.dateOfBirth) {
            const birthDate = new Date(form.personalData.dateOfBirth);
            if (!isNaN(birthDate.getTime())) {
                const today = new Date();
                age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
            }
        }

        const maritalStatusLabel =
            form.socialProfile?.maritalStatus === 1
                ? 'متزوج'
                : form.socialProfile?.maritalStatus === 0
                ? 'أعزب'
                : 'غير محدد';

        const rawQuestionnaire: PreAppointmentQuestionnaire | null =
            this.preAppointmentQuestionnaire() ??
            raw.preAppointmentQuestionnaire ??
            raw.PreAppointmentQuestionnaire ??
            raw.data?.preAppointmentQuestionnaire ??
            null;

        const preAppointmentQuestionnaire = mapQuestionnaireForView(rawQuestionnaire);

        return {
            appointmentId: raw.appointmentId ?? this.appointmentId(),
            isPaid: typeof raw.isPaid === 'boolean' ? raw.isPaid : false,
            isProfileComplete: typeof raw.isProfileComplete === 'boolean' ? raw.isProfileComplete : false,
            personalData: form.personalData,
            sportsData: form.sportsData,
            injuryData: form.injuryData,
            injuryHistory: form.injuryHistory,
            medicalHistory: form.medicalHistory,
            socialProfile: form.socialProfile,
            selectedMuscles: form.selectedMuscles || [],
            preAppointmentQuestionnaire,
            ui: {
                ...(form.ui || {}),
                initials,
                age,
                maritalStatusLabel
            }
        };
    }

    scrollToSection(sectionId: string, event?: Event): void {
        if (event) {
            event.preventDefault();
        }
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}
