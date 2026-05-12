import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProtocolService } from '../../services/protocol.service';

@Component({
    selector: 'app-protocol-activation',
    imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, InputTextarea, TagModule, TooltipModule],
    templateUrl: './protocol-activation.component.html',
    styleUrl: './protocol-activation.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtocolActivationComponent {
    private protocolService = inject(ProtocolService);
    readonly protocol = this.protocolService.activeProtocol;

    activationNotes = '';

    get totalExercises(): number {
        const proto = this.protocol();
        if (!proto) return 0;
        let count = 0;
        for (const phase of proto.phases) {
            for (const week of phase.weeks) {
                for (const session of week.sessions) {
                    for (const section of session.sections) {
                        count += section.exercises.length;
                    }
                }
            }
        }
        return count;
    }

    get totalConfiguredSessions(): number {
        const proto = this.protocol();
        if (!proto) return 0;
        let count = 0;
        for (const phase of proto.phases) {
            for (const week of phase.weeks) {
                count += week.sessions.length;
            }
        }
        return count;
    }

    activateProtocol(): void {
        this.protocolService.finaliseProtocol();
    }
}
