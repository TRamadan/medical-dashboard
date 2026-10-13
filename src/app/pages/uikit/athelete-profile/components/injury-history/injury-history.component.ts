import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InjuryHistoryData } from '../../models/athlete-profile.models';

@Component({
  selector: 'app-injury-history',
  imports: [CommonModule, CardModule, TagModule, DividerModule, ButtonModule],
  templateUrl: './injury-history.component.html',
  styleUrl: './injury-history.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InjuryHistoryComponent {
  data = input<InjuryHistoryData | null>(null);
  loading = input(false);

  getTimelineIcon(type: string): string {
    switch (type) {
      case 'Surgery':          return 'pi pi-heart-fill';
      case 'Consultation':     return 'pi pi-user-edit';
      case 'ExternalReferral': return 'pi pi-send';
      case 'MedicalReport':    return 'pi pi-file-pdf';
      default:                 return 'pi pi-circle';
    }
  }

  translateGrade(grade: string): string {
    const map: Record<string, string> = {
      Grade1: 'درجة 1', Grade2: 'درجة 2', Grade3: 'درجة 3',
    };
    return map[grade] ?? grade;
  }

  translateSide(side: string): string {
    const map: Record<string, string> = {
      Right: 'يمين', Left: 'يسار', Both: 'كلا الجانبين',
    };
    return map[side] ?? side;
  }
}
