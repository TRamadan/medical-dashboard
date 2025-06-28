import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableComponent, TableColumn } from "../../../shared/table/table.component";
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TabsComponent } from '../../../shared/tabs/tabs.component';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { WorkingHoursComponent } from "./working-hours/working-hours.component";

interface CategoryService {
  id: number;
  categoryName: string;
  services: Service[];
}

interface Service {
  id: number;
  name: string;
  price: number
}

@Component({
  selector: 'app-add-user',
  imports: [WorkingHoursComponent, InputTextModule, FormsModule, ReactiveFormsModule, FloatLabelModule, DialogModule, TableComponent, ToolbarModule, ButtonModule, CardModule, NgClass, ToggleSwitchModule, TabsComponent, DropdownModule, MultiSelectModule],
  standalone: true,
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit, AfterViewInit {
  addNewUserForm !: FormGroup;
  allUsers: any[] = []
  userDialog: boolean = false;
  isEdit: boolean = false;
  isDelete: boolean = false;
  isEmployee: boolean = false;
  showPassword = false;
  showConfirmPassword = false;
  allLocations: any[] = [];
  allSpecialities: any[] = []
  coachTabs: any[] = [];
  @ViewChild('coachInfoTab') coachInfoTab!: TemplateRef<any>;
  @ViewChild('assignedServiceTab') assignedServiceTab!: TemplateRef<any>;
  @ViewChild('workingHoursTab') workingHoursTab!: TemplateRef<any>;
  @ViewChild('daysOffTab') daysOffTab!: TemplateRef<any>;


  constructor(private fb: FormBuilder) { }

  headers: TableColumn[] = [
    { label: 'Category Name', field: 'name', type: 'text', sortable: true },
    { label: 'No.of services', field: 'numberOfsubCatrgories', type: 'text', sortable: false },
  ];

  categoryService: CategoryService[] = [];

  ngOnInit() {
    this.getAllUsers();
    this.getAllAddedLocations();
    this.getAllAddedSpecialities();
    this.getAllCategoriesAndServices();
    this.initialiseUserForm();
  }

  ngAfterViewInit() {
    this.coachTabs = [
      { label: 'Coach Information', template: this.coachInfoTab },
      { label: 'Assigned Service', template: this.assignedServiceTab },
      { label: 'Working Hours', template: this.workingHoursTab },
      { label: 'Days Off', template: this.daysOffTab }
    ];
  }

  //here is the function needed to initialise the form related for add a new user 
  initialiseUserForm(): void {
    this.addNewUserForm = this.fb.group({
      username: [null, Validators.required],
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      email: [null, Validators.required],
      password: [null, Validators.required],
      confirmPassword: [null, Validators.required],
      isCoach: [false],
      coachInfo: this.fb.group({
        firstName: [null, Validators.required],
        lastName: [null, Validators.required],
        location: [null, Validators.required],
        speciality: [[], Validators.required],
        email: [null, Validators.required],
        password: [null, Validators.required],
        confirmPassword: [null, Validators.required]
      })
    }, { validators: this.passwordsMatchValidator });
  }

  /**
   * Custom validator to check if password and confirmPassword match
   */
  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  //here is the function needed to open a dialog for add a new user 
  openAddUserDialog(): void {
    this.userDialog = true;
  }

  //here is the function needed to get all added users 
  getAllUsers(): void { }

  //here is the function needed to add a new user  
  addNewUser(): void { }

  //here is the function needed to update the selected user 
  updateSelectedUser(): void { }

  //here is the fucntion needed to delete or deactive the selected user 
  confirmDeleteSelectedUser(): void { }

  //here is the function needed to open a dialog responsible for edit the selected user 
  editSelectedUser(ev: any): void { }

  //here is the function needed to open a dialog responsible for confirm deactive the selected user 
  deleteSelectedUser(ev: any): void { }

  //here is the function needed to fetch all added locations
  getAllAddedLocations(): void {
    this.allLocations = [
      { label: 'Cairo', value: 'cairo' },
      { label: 'Alexandria', value: 'alex' },
      { label: 'Giza', value: 'giza' }
    ];
  }

  //here is the function needed to fetch all added specialities 
  getAllAddedSpecialities(): void {
    this.allSpecialities = [
      { label: 'Physiotherapy', value: 'physio' },
      { label: 'Cardiology', value: 'cardio' },
      { label: 'Nutrition', value: 'nutrition' }
    ];
  }

  //here is the function needed to fetch all categories and services based on each category 
  getAllCategoriesAndServices(): void {
    this.categoryService = [{ id: 1, categoryName: 'Sports Rehab', services: [{ id: 1, name: 'Consultation', price: 500 }, { id: 2, name: 'Rehab Session', price: 900 }] }, { id: 2, categoryName: 'Sports Recovery', services: [{ id: 3, name: 'Full Body', price: 900 }, { id: 3, name: 'Half Body', price: 600 }] }]
  }


  //here is the function needed to close the modal and rese all flags 
  hideDialog(): void {
    this.isEdit = false;
    this.isEmployee = false;
    this.addNewUserForm.reset();
    this.userDialog = false;
  }


}
