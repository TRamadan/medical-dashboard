import { Component, OnInit } from '@angular/core';
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
import { Ourteam } from './models/ourteam';

@Component({
  selector: 'app-our-team',
  templateUrl: './our-team.component.html',
  styleUrls: ['./our-team.component.css'],
  standalone: true,
  imports: [
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
  showAddDialog: boolean = false;
  addTeamForm: FormGroup;
  selectedTeamMember: Ourteam | null = null;
  teamMembers: Ourteam[] = [];
  isEdit: boolean = false;
  isDelete: boolean = false;

  certificatesOptions = [
    { label: 'Certificate A', value: 'Certificate A' },
    { label: 'Certificate B', value: 'Certificate B' },
    { label: 'Certificate C', value: 'Certificate C' }
  ];

  tableHeaders: TableColumn[] = [
    { label: 'Image', field: 'img', type: 'image' },
    { label: 'Name', field: 'name' },
    { label: 'Speciality (EN)', field: 'specialityEn' },
    { label: 'Speciality (AR)', field: 'specialityAr' },
    { label: 'Certificates', field: 'certificates' }
  ];

  constructor(private fb: FormBuilder) {
    this.addTeamForm = this.fb.group({
      img: [''],
      name: ['', Validators.required],
      specialityAr: ['', Validators.required],
      specialityEn: ['', Validators.required],
      certificates: [[], Validators.required]
    });
  }

  ngOnInit() {
    this.getAllTeamMembers();
  }

  openTeamDialog(): void {
    this.addTeamForm.reset();
    this.isEdit = false;
    this.isDelete = false;
    this.showAddDialog = true;
  }

  getAllTeamMembers(): void {
    //api logic goes here
    this.teamMembers = [
      {
        img: 'assets/placeholder-image.png',
        name: 'Dr. John Doe',
        specialityAr: 'أخصائي',
        specialityEn: 'Specialist',
        certificates: ['Certificate A', 'Certificate B']
      }
    ];
  }

  addNewTeamMember(): void {
    //api logic goes here
    const newMember = { ...this.addTeamForm.value };
    this.teamMembers.push(newMember);
    this.addTeamForm.reset();
    this.showAddDialog = false;
  }

  updateSelectedTeamMember(): void {
    //api logic goes here
    if (this.selectedTeamMember) {
      const index = this.teamMembers.findIndex(e => e === this.selectedTeamMember);
      if (index !== -1) {
        this.teamMembers[index] = { ...this.addTeamForm.value };
        this.showAddDialog = false;
        this.addTeamForm.reset();
        this.selectedTeamMember = null;
      }
    }
  }

  deleteSelectedTeamMember(): void {
    //api logic goes here
    if (this.selectedTeamMember) {
      const index = this.teamMembers.findIndex(e => e === this.selectedTeamMember);
      if (index !== -1) {
        this.teamMembers.splice(index, 1);
        this.showAddDialog = false;
        this.selectedTeamMember = null;
        this.isDelete = false;
      }
    }
  }

  editTeamMember(member: Ourteam): void {
    this.selectedTeamMember = { ...member };
    this.addTeamForm.patchValue(this.selectedTeamMember);
    this.isEdit = true;
    this.showAddDialog = true;
  }

  deleteTeamMember(member: Ourteam): void {
    this.selectedTeamMember = member;
    this.isDelete = true;
    this.showAddDialog = true;
  }

  onImageUpload(event: any): void {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.addTeamForm.patchValue({
          img: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  }
}
