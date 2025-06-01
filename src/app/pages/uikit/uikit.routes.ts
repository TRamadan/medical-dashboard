import { Routes } from '@angular/router';
import { AddCoachComponent } from './add-coach/add-coach.component';
export default [
    {
        path: 'addcoach',
        data: { breadcrumb: 'Add Coach' },
        component: AddCoachComponent
    }
] as Routes;
