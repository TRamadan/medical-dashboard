import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { MeasurementsData } from '../../models/athlete-profile.models';

@Component({
  selector: 'app-measurements-data',
  imports: [CommonModule, CardModule, ProgressBarModule, TagModule, DividerModule],
  templateUrl: './measurements-data.component.html',
  styleUrl: './measurements-data.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeasurementsDataComponent {
  data = input<MeasurementsData | null>(null);
  loading = input(false);

  getMeasurementSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'Normal':      return 'success';
      case 'NearTarget':  return 'warn';
      case 'BelowTarget': return 'danger';
      default:            return 'secondary';
    }
  }

  getMeasurementLabel(status: string): string {
    switch (status) {
      case 'Normal':      return 'طبيعي';
      case 'NearTarget':  return 'يقترب من الهدف';
      case 'BelowTarget': return 'أقل من الهدف';
      default:            return '';
    }
  }

  getWellnessLabel(key: string): string {
    const map: Record<string, string> = {
      sleepQuality: 'جودة النوم',
      fatigue: 'التعب',
      mood: 'المزاج',
      muscleSoreness: 'ألم العضلات',
      stress: 'الضغط',
    };
    return map[key] ?? key;
  }

  getWellnessKeys(): string[] {
    return ['sleepQuality', 'fatigue', 'mood', 'muscleSoreness', 'stress'];
  }

  getWellnessValue(wellness: any, key: string): number | null {
    return wellness?.[key] ?? null;
  }
}
