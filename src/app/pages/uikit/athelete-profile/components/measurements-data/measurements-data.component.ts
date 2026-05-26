import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-measurements-data',
  standalone: true,
  imports: [CommonModule, CardModule, ProgressBarModule, TagModule, DividerModule],
  templateUrl: './measurements-data.component.html',
  styleUrl: './measurements-data.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeasurementsDataComponent {}
