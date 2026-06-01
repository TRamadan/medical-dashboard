import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { OrderListModule } from 'primeng/orderlist';
import { CardModule } from 'primeng/card';
import { DynamicForm, FormSection, FormField } from './models/data.interface';



@Component({
    selector: 'app-contact-us',
    templateUrl: './contact-us.component.html',
    styleUrls: ['./contact-us.component.css'],
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        AccordionModule,
        DialogModule,
        InputTextModule,
        CheckboxModule,
        DropdownModule,
        OrderListModule,
        CardModule
    ],
    standalone: true
})
export class ContactUsComponent implements OnInit {
    ngOnInit(): void {
    }
    // Main form state
    formStructure: DynamicForm = {
        id: '1',
        name: 'My Dynamic Form',
        sections: []
    };

    // Modals visibility
    displayEditDialog: boolean = false;
    isPreviewMode: boolean = false;

    // Track active edits
    selectedField: FormField | null = null;

    // Field type options for PrimeNG dropdown
    fieldTypeOptions = [
        { label: 'Text Input', value: 'text' },
        { label: 'Number Input', value: 'number' },
        { label: 'Checkbox', value: 'checkbox' },
        { label: 'Dropdown Selection', value: 'dropdown' }
    ];

    // 1. Add a new section
    addSection() {
        const newSection: FormSection = {
            id: 'sec_' + Date.now(),
            title: `Section ${this.formStructure.sections.length + 1}`,
            fields: []
        };
        this.formStructure.sections.push(newSection);
    }

    // 2. Add a field to a specific section
    addField(section: FormSection) {
        const newField: FormField = {
            id: 'field_' + Date.now(),
            label: 'New Field Label',
            type: 'text',
            required: false,
            placeholder: 'Enter text...'
        };
        section.fields.push(newField);
    }

    // 3. Open Edit Dialog for a field
    openEditField(field: FormField) {
        // Pass a shallow/deep copy so changes don't live-update until saved if desired, 
        // or bind directly. Here we bind a reference for simplicity.
        this.selectedField = field;
        this.displayEditDialog = true;
    }

    // 4. Close Edit Dialog
    saveFieldEdits() {
        this.displayEditDialog = false;
        this.selectedField = null;
    }
}
