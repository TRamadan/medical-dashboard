import { Component, Input, OnInit } from '@angular/core';
import { TableComponent } from '../../../../shared/table/table.component';
import { Exercises } from '../models/educationcontent';

@Component({
    selector: 'app-examples',
    standalone: true,
    templateUrl: './examples.component.html',
    styleUrls: ['./examples.component.css'],
    imports: [TableComponent]
})
export class ExamplesComponent implements OnInit {
    @Input() allExamples: Exercises[] = [];
    constructor() {}

    ngOnInit() {}
}
