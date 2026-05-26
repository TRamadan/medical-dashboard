import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
@Component({
  selector: 'app-session-log',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, RatingModule, FormsModule, ButtonModule, DividerModule],
  templateUrl: './session-log.component.html',
  styleUrl: './session-log.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionLogComponent {
  sessions = input<any[]>([]);
}
