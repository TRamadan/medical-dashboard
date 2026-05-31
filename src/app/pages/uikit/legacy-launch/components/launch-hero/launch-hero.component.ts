import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-launch-hero',
  imports: [CardModule],
  templateUrl: './launch-hero.component.html',
  styleUrl: './launch-hero.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchHeroComponent {}
