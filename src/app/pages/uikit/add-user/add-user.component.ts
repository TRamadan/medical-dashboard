import { Component, OnInit } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableComponent, TableColumn } from "../../../table/table.component";
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-user',
  imports: [FloatLabelModule, DialogModule, TableComponent, ToolbarModule, ButtonModule, CardModule],
  standalone: true,
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  addNewUserForm !: FormGroup;
  allUsers: any[] = []
  userDialog: boolean = false;
  isEdit: boolean = false;
  iDelete: boolean = false;
  isEmployee: boolean = false;

  constructor(private fb: FormBuilder) { }

  headers: TableColumn[] = [
    { label: 'Category Name', field: 'name', type: 'text', sortable: true },
    { label: 'No.of services', field: 'numberOfsubCatrgories', type: 'text', sortable: false },
  ];

  ngOnInit() {
    this.getAllUsers();
    this.initialiseUserForm();
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
      birthDate: [null, Validators.required],

    })
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

  //here is the function needed to close the modal and rese all flags 
  hideDialog(): void {
    this.isEdit = false;
    this.isEmployee = false;
    this.addNewUserForm.reset();
    this.userDialog = false;
  }

}
