import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-email-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    RadioButtonModule,
    CheckboxModule,
    ButtonModule,
    CardModule
  ],
  templateUrl: './email-form.component.html',
  styleUrls: ['./email-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailFormComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    mainGoal: ['', Validators.required],
    sport: ['', Validators.required],
    problemDuration: ['', Validators.required],
    triedTreatment: [false, Validators.required],
    treatmentDetails: [''],
    howDidYouKnow: [[] as string[], Validators.required]
  });

  mainGoalOptions = [
    { label: 'العودة للرياضة', value: 'العودة للرياضة' },
    { label: 'ألم مزمن', value: 'ألم مزمن' },
    { label: 'رفع الأداء', value: 'رفع الأداء' },
    { label: 'الوقاية', value: 'الوقاية' },
    { label: 'أخرى', value: 'أخرى' }
  ];

  problemDurationOptions = [
    { label: 'أقل من أسبوعين', value: 'أقل من أسبوعين' },
    { label: 'أسبوعين - شهر', value: 'أسبوعين - شهر' },
    { label: '1 - 3 أشهر', value: '1 - 3 أشهر' },
    { label: 'أكثر من 3 أشهر', value: 'أكثر من 3 أشهر' },
    { label: 'لا توجد إصابة', value: 'لا توجد إصابة' }
  ];

  howDidYouKnowOptions = [
    { label: 'إنستجرام', value: 'إنستجرام' },
    { label: 'فيسبوك', value: 'فيسبوك' },
    { label: 'تيك توك', value: 'تيك توك' },
    { label: 'صديق', value: 'صديق' },
    { label: 'توصية طبيب', value: 'توصية طبيب' },
    { label: 'جوجل', value: 'جوجل' },
    { label: 'أخرى', value: 'أخرى' }
  ];

  isSubmitting = signal(false);

  onSubmit() {
    if (this.form.valid) {
      this.isSubmitting.set(true);
      console.log('Form Data:', this.form.value);
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting.set(false);
        this.form.reset({
          triedTreatment: false,
          howDidYouKnow: [] as string[]
        });
      }, 1000);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
