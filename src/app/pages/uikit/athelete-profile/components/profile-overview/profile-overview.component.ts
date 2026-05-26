import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-profile-overview',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, RatingModule, FormsModule, DividerModule],
  templateUrl: './profile-overview.component.html',
  styleUrl: './profile-overview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileOverviewComponent {
  sessions = input<any[]>([]);
}
