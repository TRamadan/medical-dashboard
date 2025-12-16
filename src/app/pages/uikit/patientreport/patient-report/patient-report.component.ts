import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-patient-report',
    imports: [CardModule, InputTextModule, TextareaModule, FormsModule],
    standalone: true,
    templateUrl: './patient-report.component.html',
    styleUrl: './patient-report.component.scss'
})
export class PatientReportComponent {
    @Input() report = {
        injuryName: '',
        description: '',
        recommendation: ''
    };
    @Output() reportChange = new EventEmitter<any>();
}
