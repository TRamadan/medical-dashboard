import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-profile-summary-side',
  standalone: true,
  imports: [CommonModule, CardModule, DividerModule, ButtonModule, TagModule],
  templateUrl: './profile-summary-side.component.html',
  styleUrl: './profile-summary-side.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileSummarySideComponent {}
