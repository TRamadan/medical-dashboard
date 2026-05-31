import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ServicesService } from '../../../add-service/services/services.service';
import { Services } from '../../../add-service/models/services';
import { CardModule } from "primeng/card";
import { CommonModule } from '@angular/common';
import { LocationService } from '../../../add-location/services/location.service';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-next-path-tab',
  standalone: true,
  imports: [CardModule, CommonModule, SelectModule, FormsModule],
  templateUrl: './next-path-tab.component.html',
  styleUrl: './next-path-tab.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NextPathTabComponent {
  private servicesService = inject(ServicesService);
  private locationService = inject(LocationService);

  services = toSignal(this.servicesService.getServices(), {
    initialValue: [] as Services[]
  });

  locations = toSignal(this.locationService.getLocations(), {
    initialValue: [] as any[]
  });

  selectedLocationId = signal<number | null>(null);


  selectedPathId = signal<number | null>(null);
  decision = signal<string | null>(null);

  reasonLabel = computed(() => {
    const d = this.decision();
    if (d === 'pause') return 'سبب الإيقاف المؤقت';
    if (d === 'transfer') return 'الفرع المستهدف';
    if (d === 'exit') return 'سبب الإنهاء';
    return '';
  });

  reasonPlaceholder = computed(() => {
    const d = this.decision();
    if (d === 'pause') return 'ما الذي يجعله يوقف؟';
    if (d === 'transfer') return 'أي فرع؟';
    if (d === 'exit') return 'السبب — يُستخدم في تحليل Churn';
    return 'اكتب السبب...';
  });

  setPath(id: number) {
    this.selectedPathId.set(id);
  }

  setDecision(k: string) {
    this.decision.set(k);
  }

  getIcon(name: string | undefined): string {
    if (!name) return '⚙️';
    const n = name.toLowerCase();
    if (n.includes('shield') || n.includes('resilient')) return '🛡';
    if (n.includes('peak')) return '⚡';
    if (n.includes('recharge')) return '🔋';
    return '📋';
  }

  getStyleClass(name: string | undefined): string {
    if (!name) return '';
    const n = name.toLowerCase();
    if (n.includes('shield') || n.includes('resilient')) return 'pc-shield';
    if (n.includes('peak')) return 'pc-peak';
    if (n.includes('recharge')) return 'pc-recharger';
    return '';
  }
}
