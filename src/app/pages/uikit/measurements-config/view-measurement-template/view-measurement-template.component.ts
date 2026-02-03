import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MeasurementInputType, SubjectiveAnswerType } from '../constants/measurements';
import { TemplateMeasurementEntry } from '../models/measurementtemplates';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { TextareaModule } from 'primeng/textarea';

@Component({
    selector: 'app-view-measurement-template',
    imports: [InputNumberModule, SliderModule, TextareaModule, FormsModule, ReactiveFormsModule],
    templateUrl: './view-measurement-template.component.html',
    styleUrl: './view-measurement-template.component.scss'
})
export class ViewMeasurementTemplateComponent implements OnChanges {
    @Input() templateMeasurements: any[] = [];
    templateData: any[] | null = null;
    form!: FormGroup;

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({});
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['templateMeasurements'] && changes['templateMeasurements'].currentValue?.length) {
            this.templateData = changes['templateMeasurements'].currentValue;
            this.buildForm(this.templateData);
        }
    }

    private buildForm(data: any): void {
        const group: { [key: string]: any } = {};

        data.forEach((entry: any) => {
            const m = entry.measurement;
            const controlName = this.controlName(entry);
            let validators: any[] = [Validators.required];

            if (m.inputType === MeasurementInputType.Number) {
                if (m.minValue !== null) validators.push(Validators.min(m.minValue));
                if (m.maxValue !== null) validators.push(Validators.max(m.maxValue));
            }

            if (m.inputType === MeasurementInputType.Scale) {
                if (m.minValue !== null) validators.push(Validators.min(m.minValue));
                if (m.maxValue !== null) validators.push(Validators.max(m.maxValue));
            }

            group[controlName] = [null, validators];
        });

        this.form = this.fb.group(group);
    }

    controlName(entry: any): string {
        return `measurement_${entry.measurementId}`;
    }

    getControl(entry: TemplateMeasurementEntry): FormControl {
        return this.form.get(this.controlName(entry)) as FormControl;
    }

    getWidgetType(m: any): 'number' | 'boolean' | 'scale' | 'text' | 'yesno' {
        if (m.inputType === MeasurementInputType.Text && m.answerType === SubjectiveAnswerType.YesNo) {
            return 'yesno';
        }
        switch (m.inputType) {
            case MeasurementInputType.Number:
                return 'number';
            case MeasurementInputType.Boolean:
                return 'boolean';
            case MeasurementInputType.Scale:
                return 'scale';
            case MeasurementInputType.Text:
                return 'text';
            default:
                return 'text';
        }
    }

    getScaleTicks(m: any): number[] {
        const min = m.minValue ?? 0;
        const max = m.maxValue ?? 10;
        const ticks: number[] = [];
        for (let i = min; i <= max; i += m.step ?? 1) {
            ticks.push(i);
        }
        return ticks;
    }
}
