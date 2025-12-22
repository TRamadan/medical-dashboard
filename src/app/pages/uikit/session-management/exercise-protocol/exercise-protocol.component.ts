import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';

@Component({
    selector: 'app-exercise-protocol',
    imports: [AccordionModule],
    standalone: true,
    templateUrl: './exercise-protocol.component.html',
    styleUrl: './exercise-protocol.component.scss'
})
export class ExerciseProtocolComponent {
    phases: any[] = [
        {
            id: 1,
            title: 'Phase 1: Pain & Swelling Control',
            weeks: 'Weeks 1-2',
            sessions: 'Sessions 1-6',
            completed: true,
            current: false
        },
        {
            id: 2,
            title: 'Phase 2: Range of Motion',
            weeks: 'Weeks 3-5',
            sessions: 'Sessions 7-15',
            completed: false,
            current: true,
            objectives: 'Restore full ROM, begin light strengthening, improve flexibility',
            exercises: [
                { name: 'Stationary bike: 10-15 minutes (low resistance)', completed: true },
                { name: 'Heel slides: 3 sets of 15 reps', completed: true },
                { name: 'Wall slides: 3 sets of 10 reps', completed: true },
                { name: 'Mini squats (0-45 degrees): 3 sets of 10 reps', completed: true },
                { name: 'Step-ups (4-inch height): 3 sets of 10 reps', completed: true },
                { name: 'Hamstring curls: 3 sets of 12 reps (light weight)', completed: true },
                { name: 'Calf raises: 3 sets of 15 reps', completed: true }
            ],
            measurementNote: 'Measurements due after session 15'
        }
    ];

    activeIndex: number = 1;
}
