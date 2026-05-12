import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProtocolService } from '../../services/protocol.service';
import { Protocol } from '../../models/protocol.model';

@Component({
    selector: 'app-all-protocols',
    imports: [CommonModule, CardModule, TagModule, ButtonModule, TooltipModule],
    templateUrl: './all-protocols.component.html',
    styleUrl: './all-protocols.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllProtocolsComponent {
    private protocolService = inject(ProtocolService);
    readonly protocols = this.protocolService.protocols;

    readonly activeTab = signal<'active' | 'draft' | 'archived'>('active');

    readonly filteredProtocols = computed(() =>
        this.protocols().filter(p => p.status === this.activeTab())
    );

    readonly tabCounts = computed(() => ({
        active: this.protocols().filter(p => p.status === 'active').length,
        draft: this.protocols().filter(p => p.status === 'draft').length,
        archived: this.protocols().filter(p => p.status === 'archived').length,
    }));

    setTab(tab: 'active' | 'draft' | 'archived'): void {
        this.activeTab.set(tab);
    }

    viewProtocol(protocol: Protocol): void {
        this.protocolService.viewProtocol(protocol);
    }

    editProtocol(protocol: Protocol): void {
        this.protocolService.editProtocol(protocol);
    }

    getSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
        switch (status) {
            case 'active': return 'success';
            case 'draft': return 'warn';
            case 'archived': return 'danger';
            default: return 'info';
        }
    }

    getStatusIcon(status: string): string {
        switch (status) {
            case 'active': return 'pi pi-check-circle';
            case 'draft': return 'pi pi-pencil';
            case 'archived': return 'pi pi-inbox';
            default: return 'pi pi-info-circle';
        }
    }
}
