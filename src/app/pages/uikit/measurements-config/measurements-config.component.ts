import { Component } from '@angular/core';
import { MeasurementCategoriesComponent } from './measurement-categories/measurement-categories.component';
@Component({
    selector: 'app-measurements-config',
    imports: [MeasurementCategoriesComponent],
    templateUrl: './measurements-config.component.html',
    styleUrl: './measurements-config.component.scss'
})
export class MeasurementsConfigComponent {}
