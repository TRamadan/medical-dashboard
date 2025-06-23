import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule, Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { CommonModule } from '@angular/common';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TableComponent } from '../../../table/table.component';
import { Superstars } from './models/superstars';
// import { FileUploadModule } from 'primeng/fileupload';
// import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-super-stars',
  templateUrl: './super-stars.component.html',
  styleUrls: ['./super-stars.component.css'],
  standalone: true,
  imports: [
    InputIconModule,
    IconFieldModule,
    CommonModule,
    ToolbarModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    TableModule,
    InputTextModule,
    TableComponent
  ]
})
export class SuperStarsComponent implements OnInit {
  showAddDialog: boolean = false;
  addSuperStarForm: FormGroup;
  selectedSuperStar: Superstars[] = []
  superStars: any[] = [];
  isEdit: boolean = false;
  isDelete: boolean = false;
  tableHeaders = [
    { label: 'Image', field: 'imageUrl', type: 'image' },
    { label: 'Name (EN)', field: 'nameEn' },
    { label: 'Name (AR)', field: 'nameAr' },
    { label: 'Sport (EN)', field: 'sportEn' },
    { label: 'Sport (AR)', field: 'sportAr' },
    { label: 'Achievement (EN)', field: 'achievementEn' },
    { label: 'Achievement (AR)', field: 'achievementAr' },
    { label: 'Short Word (EN)', field: 'shortWordEn' },
    { label: 'Short Word (AR)', field: 'shortWordAr' },
    { label: 'Status', field: 'status' }
  ];

  constructor(private fb: FormBuilder) {
    this.addSuperStarForm = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      sportEn: ['', Validators.required],
      sportAr: ['', Validators.required],
      achievementEn: ['', Validators.required],
      achievementAr: ['', Validators.required],
      shortWordEn: ['', Validators.required],
      shortWordAr: ['', Validators.required],
      image: [null],
      imageUrl: ['']
    });
  }

  ngOnInit() { }


  toggleDeleteSuperStar(index: number) {
    const star = this.superStars[index];
    star.status = star.status === 'deleted' ? 'active' : 'deleted';
  }



  openServiceDialog(): void {
    this.addSuperStarForm.reset();
    this.isEdit = false;
    this.isDelete = false;
    this.showAddDialog = true;
  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Porpuse : this function is responsible for fetching and endpoint that fetch all added super stars
   */
  getAllSuperStars(): void {
    //api logic goes here
  }


  /**
  * Developer : Eng/Tarek Ahmed Ramadan
  * Created Date : 10/6/2025
  * Porpuse : this function is responsible for fetching and endpoint that to add a new super stars
  */
  addNewSuperStar(): void {
    //api logic goes here
    const newStar = { ...this.addSuperStarForm.value, status: 'active' };
    this.superStars.push(newStar);
    this.addSuperStarForm.reset();
    this.showAddDialog = false;
    this.isEdit = false;
  }

  /**
* Developer : Eng/Tarek Ahmed Ramadan
* Created Date : 10/6/2025
* Porpuse : this function is responsible for fetching and endpoint that to update the selected super stars
*/
  updateSelectedSuperStar(): void {
    //api logic goes here
  }

  /**
* Developer : Eng/Tarek Ahmed Ramadan
* Created Date : 10/6/2025
* Porpuse : this function is responsible for fetching and endpoint that to update the delete selected super stars
*/
  deleteSelectedSuperStar(): void {
    //api logic goes here
  }

  /**
 * Developer : Eng/Tarek Ahmed Ramadan
 * Created Date : 1/6/2025
 * Porpuse : fetch accurate data by search in an input in the desired table
 * @param table
 * @param event
 */
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  /**
* Developer : Eng/Tarek Ahmed Ramadan
* Created Date : 10/6/2025
* Porpuse : open a dialog and set the data for the selected super star in the form
* @param ev
*/
  editSuperStar(ev: any): void {
    this.selectedSuperStar = { ...ev }
    this.addSuperStarForm.patchValue({ ...this.selectedSuperStar });
    this.isEdit = true;
    this.showAddDialog = true;

  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
* Created Date : 10/6/2025
* Porpuse : open a dialog that confirm delete a super star
   * @param ev 
   */
  deleteSuperStar(ev: any): void {
    this.isDelete = true;
    this.showAddDialog = true;
  }
}
