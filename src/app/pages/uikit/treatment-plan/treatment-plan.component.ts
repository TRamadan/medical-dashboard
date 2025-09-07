import { Component, OnInit } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ToolbarModule } from 'primeng/toolbar';
import { TreatmentPlan, Patient, Coach, ProgressPhase, Session, Exercise, AssignedCoach } from './models/treatmnetplan';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-treatment-plan',
    imports: [
        TagModule,
        AccordionModule,
        TabViewModule,
        DropdownModule,
        TextareaModule,
        CheckboxModule,
        InputNumberModule,
        DatePickerModule,
        InputTextModule,
        SelectModule,
        FloatLabelModule,
        CardModule,
        ToolbarModule,
        InputIconModule,
        IconFieldModule,
        DialogModule,
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        ToastModule,
        ReactiveFormsModule
    ],
    providers: [MessageService],
    templateUrl: './treatment-plan.component.html',
    styleUrls: ['./treatment-plan.component.css']
})
export class TreatmentPlanComponent implements OnInit {
    allPatients: Patient[] = [];
    allCoaches: Coach[] = [];
    sessionActivities: any[] = [];
    addTreatmentPlanForm!: FormGroup;
    allTreatmentPlans: TreatmentPlan[] = [];
    treatmentPlanDialog: boolean = false;
    isEdit: boolean = false;
    isNew: boolean = false;
    selectedPatient: Patient | null = null;
    selectedInjuryTypes: string[] = ['Knee Injury', 'Shoulder Injury', 'Back Pain', 'Ankle Sprain', 'Hip Injury', 'Elbow Injury', 'Wrist Injury', 'Neck Pain', 'Sports Injury', 'Post-Surgery Rehabilitation', 'Chronic Pain'];
    priorityOptions = [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' }
    ];
    difficultyOptions = [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' }
    ];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        try {
            this.initialiseTreatmentPlanForm();
            this.getAllPatients();
            this.getAllCoaches();
            this.getAllTreatmentPlans();

            console.log('Component initialized successfully');
            console.log('Form structure:', this.addTreatmentPlanForm);
        } catch (error) {
            console.error('Error initializing component:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to initialize treatment plan component'
            });
        }
    }

    // Initialize treatment plan form with enhanced structure
    initialiseTreatmentPlanForm(): void {
        this.addTreatmentPlanForm = this.fb.group({
            patient: [null, Validators.required],
            injuryType: [null, Validators.required],
            injuryDescription: [null, Validators.required],
            diagnosis: [null, Validators.required],
            priority: ['medium', Validators.required],
            treatmentplanDetails: this.fb.group({
                description: [null, Validators.required],
                startDate: [null, Validators.required],
                endDate: [null, Validators.required],
                totalNumberOfSessions: [null, Validators.required],
                medicalNotes: [null],
                contraindications: [[]],
                expectedOutcome: [null, Validators.required]
            }),
            progressPhases: this.fb.array([]),
            assignedCoaches: this.fb.array([])
        });

        // Ensure the form arrays are properly initialized
        console.log('Form initialized:', this.addTreatmentPlanForm);
        console.log('Progress phases array:', this.progressPhases);
        console.log('Assigned coaches array:', this.assignedCoaches);
    }

    // Create form controls for progress phases
    createProgressPhase(): FormGroup {
        return this.fb.group({
            phaseName: [null, Validators.required],
            phaseNumber: [null, Validators.required],
            description: [null, Validators.required],
            duration: [null, Validators.required],
            goals: [[]],
            milestones: [[]],
            sessions: this.fb.array([]),
            status: ['pending']
        });
    }

    // Create form controls for sessions within phases
    createSession(): FormGroup {
        return this.fb.group({
            sessionName: [null, Validators.required],
            sessionDate: [null, Validators.required],
            duration: [null, Validators.required],
            sessionStatus: ['scheduled'],
            numberOfSessionsPerWeek: [null, Validators.required],
            numberOfSessionsPerMonth: [null, Validators.required],
            exercises: this.fb.array([]),
            notes: [null],
            coachId: [null]
        });
    }

    // Create form controls for exercises
    createExercise(): FormGroup {
        return this.fb.group({
            name: [null, Validators.required],
            description: [null, Validators.required],
            sets: [null, Validators.required],
            reps: [null, Validators.required],
            duration: [null, Validators.required],
            difficulty: ['beginner', Validators.required],
            equipment: [[]],
            instructions: [null, Validators.required],
            precautions: [null]
        });
    }

    // Create form controls for assigned coaches
    createAssignedCoach(): FormGroup {
        return this.fb.group({
            coachId: [null, Validators.required],
            assignedSessions: [null, Validators.required],
            notes: [null]
        });
    }

    // Getter methods for form arrays
    get progressPhases(): FormArray {
        const progressPhases = this.addTreatmentPlanForm?.get('progressPhases') as FormArray;
        if (!progressPhases) {
            // If the form array doesn't exist, create it
            if (this.addTreatmentPlanForm) {
                this.addTreatmentPlanForm.setControl('progressPhases', this.fb.array([]));
                return this.addTreatmentPlanForm.get('progressPhases') as FormArray;
            }
            return this.fb.array([]);
        }
        return progressPhases;
    }

    get assignedCoaches(): FormArray {
        const assignedCoaches = this.addTreatmentPlanForm?.get('assignedCoaches') as FormArray;
        if (!assignedCoaches) {
            // If the form array doesn't exist, create it
            if (this.addTreatmentPlanForm) {
                this.addTreatmentPlanForm.setControl('assignedCoaches', this.fb.array([]));
                return this.addTreatmentPlanForm.get('assignedCoaches') as FormArray;
            }
            return this.fb.array([]);
        }
        return assignedCoaches;
    }

    getSessionsArray(phaseIndex: number): FormArray {
        try {
            if (this.progressPhases && this.progressPhases.at(phaseIndex)) {
                const phase = this.progressPhases.at(phaseIndex);
                if (phase && phase.get('sessions')) {
                    const sessions = phase.get('sessions') as FormArray;
                    return sessions || this.fb.array([]);
                }
            }
        } catch (error) {
            console.error('Error getting sessions array:', error);
        }
        return this.fb.array([]);
    }

    getExercisesArray(phaseIndex: number, sessionIndex: number): FormArray {
        try {
            const sessions = this.getSessionsArray(phaseIndex);
            if (sessions && sessions.at(sessionIndex)) {
                const session = sessions.at(sessionIndex);
                if (session && session.get('exercises')) {
                    const exercises = session.get('exercises') as FormArray;
                    return exercises || this.fb.array([]);
                }
            }
        } catch (error) {
            console.error('Error getting exercises array:', error);
        }
        return this.fb.array([]);
    }

    // Add methods for form arrays
    addProgressPhase() {
        try {
            this.progressPhases.push(this.createProgressPhase());
        } catch (error) {
            console.error('Error adding progress phase:', error);
        }
    }

    addSession(phaseIndex: number) {
        try {
            const sessions = this.getSessionsArray(phaseIndex);
            if (sessions) {
                sessions.push(this.createSession());
            }
        } catch (error) {
            console.error('Error adding session:', error);
        }
    }

    addExercise(phaseIndex: number, sessionIndex: number) {
        try {
            const exercises = this.getExercisesArray(phaseIndex, sessionIndex);
            if (exercises) {
                exercises.push(this.createExercise());
            }
        } catch (error) {
            console.error('Error adding exercise:', error);
        }
    }

    addAssignedCoach() {
        try {
            this.assignedCoaches.push(this.createAssignedCoach());
        } catch (error) {
            console.error('Error adding assigned coach:', error);
        }
    }

    // Remove methods for form arrays
    removeProgressPhase(index: number) {
        try {
            if (this.progressPhases.length > 1) {
                this.progressPhases.removeAt(index);
            }
        } catch (error) {
            console.error('Error removing progress phase:', error);
        }
    }

    removeSession(phaseIndex: number, sessionIndex: number) {
        try {
            const sessions = this.getSessionsArray(phaseIndex);
            if (sessions.length > 0) {
                sessions.removeAt(sessionIndex);
            }
        } catch (error) {
            console.error('Error removing session:', error);
        }
    }

    removeExercise(phaseIndex: number, sessionIndex: number, exerciseIndex: number) {
        try {
            const exercises = this.getExercisesArray(phaseIndex, sessionIndex);
            if (exercises.length > 0) {
                exercises.removeAt(exerciseIndex);
            }
        } catch (error) {
            console.error('Error removing exercise:', error);
        }
    }

    removeAssignedCoach(index: number) {
        try {
            if (this.assignedCoaches.length > 1) {
                this.assignedCoaches.removeAt(index);
            }
        } catch (error) {
            console.error('Error removing assigned coach:', error);
        }
    }

    // Patient selection handler
    onPatientSelect(patient: Patient) {
        this.selectedPatient = patient;
        this.addTreatmentPlanForm.patchValue({
            injuryType: patient.injuryType,
            injuryDescription: patient.injuryDescription,
            diagnosis: patient.diagnosis
        });
    }

    // Get available coaches by specialization
    getAvailableCoaches(specialization?: string): Coach[] {
        if (!specialization) {
            return this.allCoaches.filter((coach) => coach.currentWorkload < coach.maxWorkload);
        }
        return this.allCoaches.filter((coach) => coach.specialization.toLowerCase().includes(specialization.toLowerCase()) && coach.currentWorkload < coach.maxWorkload);
    }

    // Calculate coach workload
    calculateCoachWorkload(coachId: number): number {
        const coach = this.allCoaches.find((c) => c.id === coachId);
        return coach ? coach.currentWorkload : 0;
    }

    // Save treatment plan
    saveTreatmentPlan() {
        if (this.addTreatmentPlanForm.valid) {
            const formValue = this.addTreatmentPlanForm.value;
            const treatmentPlan: TreatmentPlan = {
                ...formValue,
                id: Date.now(),
                patientName: this.selectedPatient?.name,
                doctorId: 1, // Current doctor ID
                doctorName: 'Dr. Current', // Current doctor name
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (this.isNew) {
                this.allTreatmentPlans.push(treatmentPlan);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Treatment plan created successfully'
                });
            } else {
                const index = this.allTreatmentPlans.findIndex((tp) => tp.id === treatmentPlan.id);
                if (index !== -1) {
                    this.allTreatmentPlans[index] = treatmentPlan;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Treatment plan updated successfully'
                    });
                }
            }

            this.hideDialog();
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please fill all required fields'
            });
        }
    }

    // Get all registered and verified patients
    getAllPatients(): void {
        // Mock data - replace with actual API call
        this.allPatients = [
            {
                id: 1,
                name: 'Ahmed Hassan',
                age: 35,
                phone: '+201234567890',
                email: 'ahmed@example.com',
                injuryType: 'Knee Injury',
                injuryDescription: 'ACL tear in right knee',
                diagnosis: 'Complete ACL rupture requiring surgical intervention',
                medicalHistory: 'No previous knee injuries',
                currentMedications: ['Ibuprofen'],
                allergies: ['Penicillin'],
                emergencyContact: '+201234567891'
            },
            {
                id: 2,
                name: 'Fatima Ali',
                age: 28,
                phone: '+201234567892',
                email: 'fatima@example.com',
                injuryType: 'Shoulder Injury',
                injuryDescription: 'Rotator cuff strain',
                diagnosis: 'Grade 2 rotator cuff strain',
                medicalHistory: 'Previous shoulder dislocation',
                currentMedications: [],
                allergies: [],
                emergencyContact: '+201234567893'
            }
        ];
    }

    // Get all available coaches
    getAllCoaches(): void {
        // Mock data - replace with actual API call
        this.allCoaches = [
            {
                id: 1,
                name: 'Coach Mohamed',
                specialization: 'Sports Rehabilitation',
                experience: 8,
                availability: ['Monday', 'Wednesday', 'Friday'],
                currentWorkload: 12,
                maxWorkload: 20,
                rating: 4.8,
                certifications: ['Sports Medicine', 'Physical Therapy']
            },
            {
                id: 2,
                name: 'Coach Sara',
                specialization: 'Orthopedic Rehabilitation',
                experience: 5,
                availability: ['Tuesday', 'Thursday', 'Saturday'],
                currentWorkload: 8,
                maxWorkload: 15,
                rating: 4.6,
                certifications: ['Orthopedic Therapy', 'Manual Therapy']
            }
        ];
    }

    // Get all added treatment plans
    getAllTreatmentPlans(): void {
        // Mock data - replace with actual API call
        this.allTreatmentPlans = [
            {
                id: 1,
                patientId: 1,
                patientName: 'Ahmed Hassan',
                injuryType: 'Knee Injury',
                description: 'Post-ACL surgery rehabilitation plan',
                startDate: '2024-01-15',
                endDate: '2024-04-15',
                totalNumberOfSessions: 24,
                status: 'active',
                priority: 'high',
                progressPhases: [],
                assignedCoaches: [],
                doctorName: 'Dr. Current'
            }
        ];
    }

    // Open dialog to add a treatment plan
    addTreatmentPlanDialog(): void {
        // Open dialog immediately after form initialization
        this.treatmentPlanDialog = true;
        this.isNew = true;
        // try {
        //
        //     // Reset form and clear arrays
        //     this.addTreatmentPlanForm.reset();

        //     // Clear and reinitialize form arrays
        //     while (this.progressPhases.length !== 0) {
        //         this.progressPhases.removeAt(0);
        //     }
        //     while (this.assignedCoaches.length !== 0) {
        //         this.assignedCoaches.removeAt(0);
        //     }

        //     this.selectedPatient = null;

        //     // Set default values
        //     this.addTreatmentPlanForm.patchValue({
        //         priority: 'medium'
        //     });

        //     // Add initial phase and coach assignment
        //     this.addProgressPhase();
        //     this.addAssignedCoach();

        //     // Ensure the form arrays are properly initialized
        //     // Add at least one session to the first phase
        //     if (this.progressPhases.length > 0) {
        //         this.addSession(0);
        //     }

        //     this.isEdit = false;

        //     console.log('Dialog opened successfully');
        //     console.log('Form arrays:', {
        //         progressPhases: this.progressPhases.length,
        //         assignedCoaches: this.assignedCoaches.length
        //     });

        // }
        // catch (error) {
        //     console.error('Error opening dialog:', error);
        //     this.messageService.add({
        //         severity: 'error',
        //         summary: 'Error',
        //         detail: 'Failed to open treatment plan dialog'
        //     });
        // }
    }

    // Edit treatment plan
    editTreatmentPlan(treatmentPlan: TreatmentPlan): void {
        this.addTreatmentPlanForm.patchValue({
            patient: treatmentPlan.patientId,
            injuryType: treatmentPlan.injuryType,
            description: treatmentPlan.description,
            startDate: treatmentPlan.startDate,
            endDate: treatmentPlan.endDate,
            totalNumberOfSessions: treatmentPlan.totalNumberOfSessions,
            priority: treatmentPlan.priority
        });

        this.selectedPatient = this.allPatients.find((p) => p.id === treatmentPlan.patientId) || null;
        this.treatmentPlanDialog = true;
        this.isEdit = true;
        this.isNew = false;
    }

    // Hide dialog
    hideDialog() {
        this.treatmentPlanDialog = false;
        this.progressPhases.clear();
        this.assignedCoaches.clear();
        this.addTreatmentPlanForm.reset();
        this.selectedPatient = null;
        this.isEdit = false;
        this.isNew = false;
    }

    // Get status severity for display
    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (status) {
            case 'active':
                return 'success';
            case 'draft':
                return 'warn';
            case 'completed':
                return 'info';
            case 'paused':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    // Get priority severity for display
    getPrioritySeverity(priority: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (priority) {
            case 'urgent':
                return 'danger';
            case 'high':
                return 'warn';
            case 'medium':
                return 'info';
            case 'low':
                return 'success';
            default:
                return 'secondary';
        }
    }

    // Global filter for tables
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
