import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { Card } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';

@Component({
    selector: 'app-edit-protocol',
    imports: [AccordionModule, Card, TabViewModule],
    standalone: true,
    templateUrl: './edit-protocol.component.html',
    styleUrl: './edit-protocol.component.scss'
})
export class EditProtocolComponent {}
