import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { TableComponent, TableColumn } from '../../../shared/table/table.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Advisors, OurTeam } from './models/ourteam';
import { catchError, forkJoin, of } from 'rxjs';
import { OurTeamService } from './services/our-team.service';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { TabsComponent } from '../../../shared/tabs/tabs.component';
import { FileUploadInputComponent } from '../../../shared/file-upload-input/file-upload-input.component';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-our-team',
    providers: [MessageService],
    templateUrl: './our-team.component.html',
    styleUrls: ['./our-team.component.css'],
    standalone: true,
    imports: [
        ToastModule,
        FileUploadInputComponent,
        TabsComponent,
        CardModule,
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        DialogModule,
        TableModule,
        InputTextModule,
        ToolbarModule,
        FileUploadModule,
        TableComponent,
        MultiSelectModule,
        FloatLabelModule
    ]
})
export class OurTeamComponent implements OnInit {
    @ViewChild('advisorsTab') advisorsTab!: TemplateRef<any>;
    @ViewChild('teamMemberTab') teamMemberTab!: TemplateRef<any>;

    @ViewChild('advisorsFormTab') advisorsFormTab!: TemplateRef<any>;
    @ViewChild('teamMemberFormTab') teamMemberFormTab!: TemplateRef<any>;

    showAddDialog: boolean = false;
    addTeamForm!: FormGroup;
    addAdvisorForm!: FormGroup;
    selectedTeamMember: OurTeam | null = null;
    teamMembers: OurTeam[] = [];
    selectedAdvisor: Advisors = {};
    allTeamMembers: OurTeam[] = [];
    allAdvisors: Advisors[] = [];
    isEdit: boolean = false;
    activeTabIndex = 0;
    isDelete: boolean = false;

    advisorsHeader: TableColumn[] = [
        { label: 'Image', field: 'image', type: 'image' },
        { label: 'Name', field: 'name' },
        { label: 'Job Description (AR)', field: 'jobDescriptionAr' },
        { label: 'Job Description (EN)', field: 'jobDescriptionEn' },
        { label: 'Job (AR)', field: 'jobAr' },
        { label: 'Job (EN)', field: 'jobEn' },
        { label: 'Short Paragraph (AR)', field: 'shortParagraphAr' },
        { label: 'Short Paragraph (EN)', field: 'shortParagraphEn' }
    ];

    teamMembersHeader: TableColumn[] = [
        { label: 'Image', field: 'image', type: 'image' },
        { label: 'Name', field: 'name' },
        { label: 'Role (AR)', field: 'roleAr' },
        { label: 'Role (EN)', field: 'roleEn' },
        { label: 'Specialization (AR)', field: 'specializationAr' },
        { label: 'Specialization (EN)', field: 'specializationEn' }
    ];
    constructor(
        private fb: FormBuilder,
        private _ourTeamService: OurTeamService,
        private _messageService: MessageService
    ) {
        this.addTeamForm = this.fb.group({
            id: [null],
            name: ['', Validators.required],
            img: ['']
        });
        this.addAdvisorForm = this.fb.group({
            id: [null],
            name: [
                '',
                [Validators.required, Validators.pattern(/^[A-Za-z\s]{3,50}$/)] // only letters, 3–50 chars
            ],
            jobAr: [
                '',
                [Validators.required, Validators.pattern(/^[\u0600-\u06FF\s]{2,50}$/)] // Arabic job title
            ],
            jobEn: [
                '',
                [Validators.required, Validators.pattern(/^[A-Za-z\s]{2,50}$/)] // English job title
            ],
            jobDescriptionAr: [
                '',
                [Validators.required, Validators.pattern(/^[\u0600-\u06FF\s]{10,200}$/)] // Arabic text
            ],
            jobDescriptionEn: [
                '',
                [Validators.required, Validators.pattern(/^[A-Za-z0-9\s.,-]{10,200}$/)] // English description
            ],

            shortParagraphAr: [
                '',
                [Validators.required, Validators.pattern(/^[\u0600-\u06FF\s.,-]{10,300}$/)] // Arabic paragraph
            ],
            shortParagraphEn: [
                '',
                [Validators.required, Validators.pattern(/^[A-Za-z0-9\s.,-]{10,300}$/)] // English paragraph
            ],
            image: [null]
        });
    }

    ngOnInit() {
        this.getAllTeamMembers();
    }

    onTabChange(index: number) {
        console.log('tab changed to', index);
        this.activeTabIndex = index;
    }

    openTeamDialog(): void {
        this.addTeamForm.reset();
        this.isEdit = false;
        this.isDelete = false;
        this.showAddDialog = true;
    }

    getAllTeamMembers(): void {
        forkJoin({
            advisors: this._ourTeamService.getAll('Advisorboard').pipe(
                catchError((err: any) => {
                    this._messageService.add({ severity: 'error', detail: 'There is an error on fetch advisors data' });
                    return of([]);
                })
            ),
            teamMembers: this._ourTeamService.getAll('TeamMembers').pipe(
                catchError((err: any) => {
                    this._messageService.add({ severity: 'error', detail: 'There is an error on fetch team members data' });
                    return of([]);
                })
            )
        }).subscribe({
            next: (res) => {
                this.allAdvisors = res.advisors;
                this.allTeamMembers = res.teamMembers;
            }
        });
    }

    onSave() {
        if (this.isDelete) {
            this.confirmDeleteSelectedAdvisor();
            return;
        }

        if (this.activeTabIndex === 0) {
            // advisor tab
            if (this.addAdvisorForm.invalid) {
                this.addAdvisorForm.markAllAsTouched();
                return;
            }
            if (this.isEdit) this.updateAdvisor();
            else this.addNewAdvisor();
        } else {
            // team member tab
            if (this.addAdvisorForm.invalid) {
                this.addAdvisorForm.markAllAsTouched();
                return;
            }
            if (this.isEdit) this.updateTeamMember();
            else this.addNewTeamMember();
        }
    }

    //here is the function needed to edit the selected advisor
    editSelectedAdvisor(event: any): void {
        this.selectedAdvisor = { ...event };
        this.addAdvisorForm.patchValue(this.selectedAdvisor);
        this.isEdit = true;
        this.showAddDialog = true;
    }

    //here is the function needed to edit the selected team member
    editTeamMember(event: any): void {}

    //here is the function needed to set the id for the selected deleted row
    deleteSelectedAdvisor(event: any): void {
        this.selectedAdvisor = { ...event };
        this.addAdvisorForm.controls['id'].setValue(this.selectedAdvisor.id);
        this.isDelete = true;
        this.showAddDialog = true;
    }

    //here is the function
    deleteTeamMember(event: any): void {}

    //here is the function needed to add a new advisor
    addNewAdvisor(): void {
        let payload = this.addAdvisorForm.getRawValue();
        this._ourTeamService.create('Advisorboard', payload).subscribe({
            next: (res: any) => {
                this.showAddDialog = false;
                this.getAllTeamMembers();
                this.addAdvisorForm.reset();
                this._messageService.add({ severity: 'success', detail: 'Done add new advisor' });
            },
            error: (error: any) => {
                this._messageService.add({ severity: 'error', detail: 'There is an error on add a new advisor' });
            }
        });
    }

    //here is the function needed to add a new team member
    addNewTeamMember(): void {}

    //here is the function needed to update the selected advisor
    updateAdvisor(): void {
        const payload = this.addAdvisorForm.getRawValue();
        this._ourTeamService.update('Advisorboard', payload).subscribe({
            next: (res: any) => {
                this._messageService.add({ severity: 'success', detail: 'Selected advisor updated successfully' });
                this.isEdit = false;
                this.showAddDialog = false;
                this.getAllTeamMembers();
            },
            error: (error: any) => {
                this._messageService.add({ severity: 'error', detail: 'Failed to update the selected advisor' });
            }
        });
    }

    //here is the function needed to delete the selected advisor
    confirmDeleteSelectedAdvisor(): void {
        let id = this.addAdvisorForm.controls['id'].value;
        this._ourTeamService.delete('Advisorboard', id).subscribe({
            next: (res: any) => {
                this.isDelete = false;
                this.showAddDialog = false;
                this.getAllTeamMembers();
                this._messageService.add({ severity: 'success', summary: 'Success', detail: 'Selected advisor is deleted successfully' });
            },
            error: (error: any) => {
                this._messageService.add({ severity: 'error', detail: 'There is an error on delete selected advisor' });
            }
        });
    }

    //here is the function needed to update the selected team member
    updateTeamMember(): void {}
}
