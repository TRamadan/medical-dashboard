import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

@Component({
  selector: 'app-victory-tab',
  templateUrl: './victory-tab.component.html',
  styleUrl: './victory-tab.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VictoryTabComponent {
  victorySent = signal(false);

  triggerVictory() {
    this.victorySent.set(true);
  }

  previewCard() {
    console.log('Previewing Victory Card...');
  }

  exportPdf() {
    console.log('Exporting PDF Report...');
  }

  updatePersona() {
    console.log('Updating Persona Intelligence...');
  }
}
