import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-victory-tab',
  standalone: true,
  imports: [ButtonModule, CardModule],
  templateUrl: './victory-tab.component.html',
  styleUrl: './victory-tab.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VictoryTabComponent {
  victorySent = signal(false);
  activeAction = signal<string | null>(null);

  triggerVictory() {
    this.victorySent.set(true);
  }

  previewCard() {
    console.log('Previewing Victory Card...');
  }

  exportPdf() {
    this.activeAction.set('pdf');
    console.log('Exporting PDF Report...');
  }

  updatePersona() {
    this.activeAction.set('persona');
    console.log('Updating Persona Intelligence...');
  }
}
