import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { TabViewModule } from 'primeng/tabview';
import { RatingModule } from 'primeng/rating';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';

import { ProfileOverviewComponent } from './components/profile-overview/profile-overview.component';
import { InjuryHistoryComponent } from './components/injury-history/injury-history.component';
import { ProgramPlanComponent } from './components/program-plan/program-plan.component';
import { MeasurementsDataComponent } from './components/measurements-data/measurements-data.component';
import { SessionLogComponent } from './components/session-log/session-log.component';
import { SurveysComponent } from './components/surveys/surveys.component';
import { ProfileSummarySideComponent } from './components/profile-summary-side/profile-summary-side.component';
import { QuickActionsSidebarComponent } from './components/quick-actions-sidebar/quick-actions-sidebar.component';

@Component({
  selector: 'app-athelete-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    AvatarModule,
    TagModule,
    ProgressBarModule,
    TabViewModule,
    RatingModule,
    DividerModule,
    ProfileOverviewComponent,
    InjuryHistoryComponent,
    ProgramPlanComponent,
    MeasurementsDataComponent,
    SessionLogComponent,
    SurveysComponent,
    ProfileSummarySideComponent,
    QuickActionsSidebarComponent
  ],
  templateUrl: './athelete-profile.component.html',
  styleUrl: './athelete-profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AtheleteProfileComponent {
  athlete = signal({
    name: 'هاني سالم محمد',
    age: 32,
    gender: 'ذكر',
    type: 'لاعب كرة قدم ترفيهي',
    branch: 'فرع التجمع',
    joinedDate: '21 مارس 2021',
    status: 'Return to Play',
    phase: 'المرحلة 2 - هندسة الحركة',
    session: 'جلسة 31/7',
    nps: 8.5,
    initials: 'ه س'
  });

  stats = signal([
    { label: 'تقدم البرنامج', value: 69, target: '7 من 31 جلسة', color: 'var(--blue-500)' },
    { label: 'LSI الكره', value: 68, target: 'الهدف < 2%', color: 'var(--orange-500)' },
    { label: 'RDH الكره', value: 100, target: '2 من 310 (ثانية)', color: 'var(--teal-500)' },
    { label: 'آخر VAS', value: 2, target: '10 / 2 مقبول', color: 'var(--green-500)' }
  ]);

  quickActions = signal([
    { label: 'فتح جلسة جديدة', sub: 'حجز موعد الجلسة 8', icon: 'pi pi-plus-circle' },
    { label: 'جدولة قياسات دورية', sub: 'القياس القادم - 23', icon: 'pi pi-calendar-plus' },
    { label: 'تعديل الخطة', sub: 'تغيير تمرين أو مرحلة', icon: 'pi pi-file-edit' },
    { label: 'إرسال إنذار للرياضي', sub: 'تكرار أو رسالة', icon: 'pi pi-bell' },
    { label: 'بلاغ تنبيه سريع', sub: 'إيقاف أو تعديل طارئ', icon: 'pi pi-exclamation-triangle' }
  ]);

  sessions = signal([
    { title: 'Recharger + Resilience — Swarm', date: '21 مارس، د. كريم، تحفيز، تعب عضلي خفيف - جلسة Heel Slides', rating: 1, type: 'sRPE' },
    { title: 'Recharger + Resilience — Swarm', date: '29 مارس، قياسات دورية - نتائج عند الدكتور', rating: 4, type: 'sRPE' },
    { title: 'Recharger — Swarm', date: '23 مارس، د. كريم، أداء ممتاز', rating: 2, type: 'sRPE' }
  ]);
}
