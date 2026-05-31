import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';

/** Shape of a single programme phase entry */
export interface ProgramPhase {
  name: string;
  meta: string;
  criteria: string;
  /** CSS dot class – e.g. 'bg-gold glow-gold' */
  dotClass: string;
  /** Badge text */
  badgeText: string;
  /** CSS badge class */
  badgeClass: string;
  /** CSS class for the criteria text row */
  critClass: string;
  /** Show the connecting line under the dot */
  hasLine: boolean;
}

@Component({
  selector: 'app-summary-tab',
  imports: [CardModule, ProgressBarModule],
  templateUrl: './summary-tab.component.html',
  styleUrl: './summary-tab.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryTabComponent {
  /** Programme phases — consumed by @for in the template */
  readonly phases = signal<ProgramPhase[]>([
    {
      name: 'المرحلة ١ — هندسة الألم',
      meta: '١٢ جلسة · ٤ أسابيع',
      criteria: 'VAS ≤ ٣ ✓ · ROM مد كامل ✓',
      dotClass: 'bg-gold glow-gold',
      badgeText: 'مكتملة',
      badgeClass: 'b-mint',
      critClass: 'ptcrit',
      hasLine: true
    },
    {
      name: 'المرحلة ٢ — هندسة الحركة',
      meta: '٩ جلسات · ٣ أسابيع',
      criteria: 'LSI ≥ ٧٠٪ ✓ · Quad ≥ ١٤٠N ✓',
      dotClass: 'bg-gold glow-gold',
      badgeText: 'مكتملة',
      badgeClass: 'b-mint',
      critClass: 'ptcrit',
      hasLine: true
    },
    {
      name: 'المرحلة ٣ — بناء القوة',
      meta: '٦ جلسات · ٣ أسابيع',
      criteria: 'LSI ≥ ٨٠٪ ✓ · Hop ≥ ٨٠٪ ✓',
      dotClass: 'bg-gold glow-gold',
      badgeText: 'مكتملة',
      badgeClass: 'b-mint',
      critClass: 'ptcrit',
      hasLine: true
    },
    {
      name: 'المرحلة ٤ — إعادة التدريب',
      meta: '٦ جلسات · ٧ أسابيع',
      criteria: 'LSI ≥ ٩٠٪ ✓ · Hop ≥ ٩٠٪ ✓',
      dotClass: 'bg-gold glow-gold',
      badgeText: 'مكتملة',
      badgeClass: 'b-mint',
      critClass: 'ptcrit',
      hasLine: true
    },
    {
      name: 'المرحلة ٥ — العودة للملاعب',
      meta: '٣ جلسات + قياسات ختامية · ٧ أسابيع',
      criteria: 'LSI ٩٢٪ ✓ · Hop ٩٤٪ ✓ · VAS ١ ✓',
      dotClass: 'bg-gold glow-gold',
      badgeText: '✓ مكتملة',
      badgeClass: 'b-gold',
      critClass: 'ptcrit gold-text',
      hasLine: false
    }
  ]);
}
