import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-surveys',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, DividerModule],
  templateUrl: './surveys.component.html',
  styleUrl: './surveys.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SurveysComponent {}
