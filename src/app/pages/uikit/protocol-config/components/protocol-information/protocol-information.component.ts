import { Component, ChangeDetectionStrategy, inject, OnInit, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { ProtocolTemplate } from '../../models/protocol.model';
import { ReactiveFormsModule } from '@angular/forms';
@Component({
    selector: 'app-protocol-information',
    imports: [ReactiveFormsModule, CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, InputTextarea, CheckboxModule, DropdownModule, InputNumberModule],
    templateUrl: './protocol-information.component.html',
    styleUrl: './protocol-information.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtocolInformationComponent implements OnInit {
    private protocolService = inject(ProtocolService);
    form!: FormGroup;
    private serviceCategoryService = inject(ServicecategoryService);

    readonly readonly = input(false);

    constructor(private fb: FormBuilder) {
        effect(() => {
            if (!this.form) return;
            this.readonly() ? this.form.disable() : this.form.enable();
        });
    }

    protocol = this.protocolService.activeProtocol;

    serviceCategories: { id: number; nameEn: string; nameAr: string; selected: boolean }[] = [];
    loadingServices: boolean = true;
    selectedService: any = null;
    useTemplate = false;
    selectedTemplate: ProtocolTemplate | null = null;

    athleteLevelOptions = [
        { label: 'Recreational', value: 'recreational' },
        { label: 'Amateur', value: 'amateur' },
        { label: 'Semi-Professional', value: 'semi_pro' },
        { label: 'Professional', value: 'professional' },
        { label: 'Elite / Near-Professional', value: 'elite' },
    ];

    defaultContraindications: string[] = [
        'Pain > 7/10 at start of exercise — Stop and notify the doctor',
        'New acute joint swelling within 24 hours of last session',
        'Fever > 38°C or signs of local inflammation',
    ];

    templates: ProtocolTemplate[] = [
        {
            id: 1,
            title: 'ACL Reconstruction Protocol',
            subtitle: 'ACL Tear',
            description: 'Standard post-surgical ACL rehabilitation',
            duration: '12 weeks',
            frequency: '3x/week',
            phases: '4 phases'
        },
        {
            id: 2,
            title: 'Rotator Cuff Recovery',
            subtitle: 'Shoulder Injury',
            description: 'Non-surgical rotator cuff rehabilitation',
            duration: '10 weeks',
            frequency: '2x/week',
            phases: '3 phases'
        },
        {
            id: 3,
            title: 'Hamstring Strain Protocol',
            subtitle: 'Hamstring Injury',
            description: 'Grade 2 hamstring strain recovery',
            duration: '8 weeks',
            frequency: '3x/week',
            phases: '3 phases'
        }
    ];

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
            contraindications: this.fb.array(
                this.defaultContraindications.map(text => this.fb.control(text))
            ),
            newContraindication: [''],
        });
        this.loadServiceCategories();
    }

    loadServiceCategories(): void {
        this.loadingServices = true;
        this.serviceCategoryService.getServiceCategories().subscribe({
            next: (data: any) => {
                debugger
                this.serviceCategories = data.data.map((item: any) => ({ ...item, selected: false }));
                this.loadingServices = false;
            },
            error: (err) => {
                console.error('Failed to load service categories', err);
                this.loadingServices = false;
            }
        });
    }

    onServiceChange(): void {
        const proto = this.protocol();
        if (proto && this.selectedService) {
            proto.services = [this.selectedService];
        } else if (proto) {
            proto.services = [];
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

        proto.template = template;

        const weeks = parseInt(template.duration);
        proto.weeks = isNaN(weeks) ? null : weeks;

        const frequencyMatch = template.frequency.match(/(\d+)x/);
        const frequency = frequencyMatch ? parseInt(frequencyMatch[1]) : 0;

        if (proto.weeks && frequency) {
            proto.totalSessions = proto.weeks * frequency;
        } else {
            proto.totalSessions = null;
        }
    }

    get contraindications(): FormArray {
        return this.form.get('contraindications') as FormArray;
    }

    addContraindication(): void {
        const val = this.form.get('newContraindication')?.value?.trim();
        if (val) {
            this.contraindications.push(this.fb.control(val));
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
