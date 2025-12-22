import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { ChipModule } from 'primeng/chip';
@Component({
    selector: 'app-patient-report',
    imports: [ChipModule, CardModule, InputTextModule, TextareaModule, FormsModule],
    standalone: true,
    templateUrl: './patient-report.component.html',
    styleUrl: './patient-report.component.scss'
})
export class PatientReportComponent {
    @Input() report = {
        injuryNames: [] as string[],
        description: '',
        recommendation: ''
    };
    @Output() reportChange = new EventEmitter<any>();

    ngOnInit(): void {
        if (!this.report.injuryNames) {
            this.report.injuryNames = [];
        }
    }

    currentInjuryName: string = ''; // Temporary variable for input

    addInjuryName(event: Event): void {
        event.preventDefault(); // Prevent form submission if inside a form

        const trimmedName = this.currentInjuryName.trim();

        // Only add if the input is not empty and not a duplicate
        if (trimmedName && !this.report.injuryNames.includes(trimmedName)) {
            this.report.injuryNames.push(trimmedName);
            this.currentInjuryName = ''; // Clear the input field
        }
    }

    removeInjuryName(index: number): void {
        this.report.injuryNames.splice(index, 1);
    }
}
