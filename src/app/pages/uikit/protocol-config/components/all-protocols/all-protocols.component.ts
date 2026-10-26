import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { ProtocolService } from '../../services/protocol.service';
import { Protocol } from '../../models/protocol.model';

@Component({
    selector: 'app-all-protocols',
    imports: [CommonModule, CardModule, TagModule, ButtonModule, TooltipModule, BadgeModule],
    templateUrl: './all-protocols.component.html',
    styleUrl: './all-protocols.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllProtocolsComponent implements OnInit {
    public protocolService = inject(ProtocolService);
    private readonly route = inject(ActivatedRoute);
    readonly protocols = this.protocolService.protocols;

    ngOnInit(): void {
        this.logProtocols();
        // Pre-select tab from query param (e.g. tab=Published or tab=Draft)
        const tabParam = this.route.snapshot.queryParamMap.get('tab') as 'Published' | 'Draft' | null;
        if (tabParam === 'Published' || tabParam === 'Draft') {
            this.activeTab.set(tabParam);
        }

    }
    readonly activeTab = signal<'Published' | 'Draft'>('Published');

    readonly filteredProtocols = computed(() =>
        this.protocols().filter(p => p.status === this.activeTab())


    );

    logProtocols(): void {
        effect(() => {
            console.log(this.filteredProtocols())
        })
    }


    readonly tabCounts = computed(() => ({
        active: this.protocols().filter(p => p.status === 'Published').length,
        draft: this.protocols().filter(p => p.status === 'Draft').length,
        archived: this.protocols().filter(p => p.status === 'Archived').length,
    }));

    setTab(tab: 'Published' | 'Draft'): void {
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
            case 'Published': return 'success';
            case 'Draft': return 'warn';
            case 'Archived': return 'danger';
            default: return 'info';
        }
    }

    getStatusIcon(status: string): string {
        switch (status) {
            case 'Published': return 'pi pi-check-circle';
            case 'Draft': return 'pi pi-pencil';
            case 'Archived': return 'pi pi-inbox';
            default: return 'pi pi-info-circle';
        }
    }
}
