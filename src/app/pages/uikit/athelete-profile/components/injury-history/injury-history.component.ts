import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-injury-history',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, DividerModule, ButtonModule],
  templateUrl: './injury-history.component.html',
  styleUrl: './injury-history.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InjuryHistoryComponent {}
