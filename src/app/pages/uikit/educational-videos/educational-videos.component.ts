import { Component, OnInit } from '@angular/core';
import { TableComponent } from '../../../shared/table/table.component';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Educationalvideos } from "./models/educationalvideos";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-educational-videos',
  standalone: true,
  imports: [InputTextModule, DialogModule, ReactiveFormsModule, TableComponent, ToolbarModule, ButtonModule],
  templateUrl: './educational-videos.component.html',
  styleUrls: ['./educational-videos.component.css']
})
export class EducationalVideosComponent implements OnInit {
  isEdit: boolean = false;
  isDelete: boolean = false;
  showAddDialog: boolean = false;
  addEducationalVideo!: FormGroup;
  allEductaionalVideos: Educationalvideos[] = [];
  selectedEducationalVideo: Educationalvideos | null = null;

  tableHeaders = [
    { label: 'Video category (AR)', field: 'videoCategoryAr' },
    { label: 'Video category (En)', field: 'videoCategoryEn' },
    { label: 'Description (AR)', field: 'descriptionAr' },
    { label: 'Description (EN)', field: 'descriptionEn' },
    { label: 'Video url', field: 'videoUrl' },

  ];
  constructor(private fb: FormBuilder) {
    this.addEducationalVideo = this.fb.group({
      videoCategoryEn: ['', Validators.required],
      videoCategoryAr: ['', Validators.required],
      descriptionEn: ['', Validators.required],
      descriptionAr: ['', Validators.required],
      videoUrl: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.getAllEducationalVideos();
  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan 
   * Created at : 1/6/2025
   * Purpose : this function is responsible for open a dialog that add a new educational video 
   */
  openEducationalVideosDialog(): void {
    this.showAddDialog = true;
    this.isEdit = false;
    this.isDelete = false;
  }

  /**
 * Developer : Eng/Tarek Ahmed Ramadan
 * Created Date : 10/6/2025
 * Purpose : Fetch all educational videos entries from the backend
 */
  getAllEducationalVideos(): void {
    //api logic goes here
    this.allEductaionalVideos = [
      { id: 1, descriptionAr: 'الفيديو التعليمي 1', descriptionEn: 'educational video 1', videoCategoryAr: 'فئة الفيديو 1', videoCategoryEn: 'video category 1', videoUrl: '' }
    ];
  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Purpose : Add a new About Us entry
   */
  addNewEducationalVideo(): void {
    //api logic goes here
    const newEntry = { ...this.addEducationalVideo.value, status: 'active' };
    this.allEductaionalVideos.push(newEntry);
    this.addEducationalVideo.reset();
    this.showAddDialog = false;
  }

  /**
 * Developer : Eng/Tarek Ahmed Ramadan
 * Created Date : 10/6/2025
 * Purpose : Update the selected About Us entry
 */
  updateSelectedEducationalVideo(): void {
    //api logic goes here
  }

  /**
   * Developer : Eng/Tarek Ahmed Ramadan
   * Created Date : 10/6/2025
   * Purpose : Delete the selected About Us entry
   */
  deleteSelectedEducationalVideo(): void {
    //api logic goes here
  }

  /**
  * Developer : Eng/Tarek Ahmed Ramadan
  * Created Date : 10/6/2025
  * Purpose : Open dialog and set data for the selected About Us entry in the form
  * @param entry The About Us entry to edit
  */
  editEducationalVideo(entry: Educationalvideos): void {
    this.selectedEducationalVideo = { ...entry };
    this.addEducationalVideo.patchValue(this.selectedEducationalVideo);
    this.isEdit = true;
    this.showAddDialog = true;
  }

  /**
  * Developer : Eng/Tarek Ahmed Ramadan
  * Created Date : 10/6/2025
  * Purpose : Open dialog and set data for the selected About Us entry in the form
  * @param entry The About Us entry to edit
  */
  deleteEducationalVideo(entry: Educationalvideos): void {
    this.isDelete = true;
    this.showAddDialog = true;
  }

}
