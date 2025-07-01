import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/']
                    }
                ]
            },
            {
                label: 'User management',
                items: [
                    {
                        label: 'Add user',
                        icon: '',
                        routerLink: ['/uikit/adduser']
                    },
                    {
                        label: 'Add group',
                        icon: '',
                        routerLink: ['/uikit/addgroup']
                    },
                    {
                        label: 'Add roles and permissions',
                        icon: '',
                        routerLink: ['/uikit/addpermission']
                    }
                    // {
                    //     label: 'Add Permission',
                    //     icon: ''
                    // }
                ]
            },
            {
                label: 'Doctor',
                items: [
                    { label: 'Add service', icon: '', routerLink: ['/uikit/services'] },
                    { label: 'Add location', icon: '', routerLink: ['/uikit/location'] },
                    { label: 'Appointments', icon: '', routerLink: ['/uikit/appointments'] },
                    { label: 'Add treatment plan', icon: '', routerLink: ['/uikit/treatmentplan'] },
                    {
                        label: 'Tracking session attendance',
                        icon: '',
                        routerLink: ['/uikit/trackingattendance']
                    },
                    {
                        label: 'Calendar',
                        icon: '',
                        routerLink: ['/uikit/calendar']
                    },
                    {
                        label: 'specialities',
                        icon: '',
                        routerLink: ['/uikit/specialities']
                    }
                ]
            },
            {
                label: 'Coach',
                items: [
                    {
                        label: 'session management',
                        icon: '',
                        routerLink: ['/uikit/sessionmanagement']
                    }
                ]
            },
            {
                label: 'Coach manager',
                items: [
                    {
                        label: 'coach management',
                        icon: '',
                        routerLink: ['/uikit/coachmanagement']
                    }
                ]
            },
            {
                label: 'Website control',
                items: [
                    {
                        label: 'our super stars',
                        icon: '',
                        routerLink: ['/uikit/superstars']
                    },
                    {
                        label: 'our partners',
                        icon: '',
                        routerLink: ['/uikit/partners']
                    },
                    {
                        label: 'about us',
                        icon: '',
                        routerLink: ['/uikit/aboutus']
                    },
                    {
                        label: 'our team',
                        icon: '',
                        routerLink: ['/uikit/ourteam']
                    },
                    {
                        label: 'certificates',
                        icon: '',
                        routerLink: ['/uikit/certificates']

                    },

                    {
                        label: 'our services',
                        icon: '',
                        routerLink: ['/uikit/ourservices']
                    },

                    {
                        label: 'educational videos',
                        icon: '',
                        routerLink: ['/uikit/educationalvideos']
                    },

                    {
                        label: 'join us',
                        icon: '',
                        routerLink: ['/uikit/joinus']
                    },
                    {
                        label: 'contact us',
                        icon: '',
                        routerLink: ['/uikit/contactus']
                    }
                ]
            },
            {
                label: 'Report configuration',
                items: [
                    {
                        label: 'reports',
                        icon: '',
                        routerLink: ['/uikit/reportconfig']
                    }
                ]
            }
        ];
    }
}
