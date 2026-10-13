import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SurveysData } from '../../models/athlete-profile.models';

@Component({
  selector: 'app-surveys',
  imports: [CommonModule, CardModule, TagModule, DividerModule],
  templateUrl: './surveys.component.html',
  styleUrl: './surveys.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveysComponent {
  data = input<SurveysData | null>(null);
  loading = input(false);

  get wellnessRate(): number {
    const d = this.data();
    if (!d || !d.wellnessDaysRequested) return 0;
    return Math.round((d.wellnessDaysAnswered / d.wellnessDaysRequested) * 100);
  }

  getNpsSeverity(category: string | null): 'success' | 'info' | 'danger' | 'secondary' {
    switch (category) {
      case 'Promoter':  return 'success';
      case 'Passive':   return 'info';
      case 'Detractor': return 'danger';
      default:          return 'secondary';
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

  getDayWellnessKeys(): string[] {
    return ['sleepQuality', 'fatigue', 'mood', 'muscleSoreness'];
  }

  getDayValue(day: any, key: string): number | null {
    return day?.[key] ?? null;
  }
}
