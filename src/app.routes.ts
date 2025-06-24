import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Landing } from './app/pages/landing/landing';
import { DashboardComponent } from './app/pages/uikit/dashboard/dashboard.component';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [{ path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') }, {
            path: '', component: DashboardComponent
        }]
    },
    { path: 'landing', component: Landing },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') }
];
