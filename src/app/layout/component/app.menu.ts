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
                        label: 'Hero Section Config',
                        icon: '',
                        routerLink: ['/uikit/herosectionconfig']
                    },
                    {
                        label: 'our super stars',
                        icon: '',
                        routerLink: ['/uikit/superstars']
                    },
                    {
                        label: 'Our methodology section config',
                        icon: '',
                        routerLink: ['/uikit/Methodology']
                    },
                    {
                        label: 'Our benefits section config',
                        icon: '',
                        routerLink: ['/uikit/benefits']
                    },
                    {
                        label: 'Our partners section config',
                        icon: '',
                        routerLink: ['/uikit/partners']
                    },

                    // {
                    //     label: 'Inovation hub section config',
                    //     icon: '',
                    //     routerLink: ['/uikit/inovationHub']
                    // },
                    {
                        label: 'Success Stories section config',
                        icon: '',
                        routerLink: ['/uikit/successstories']
                    },
                    // {
                    //     label: 'How it works section config',
                    //     icon: '',
                    //     routerLink: ['/uikit/howitworks']
                    // },
                    {
                        label: 'Contact us section config',
                        icon: '',
                        routerLink: ['/uikit/contactus']
                    },
                    {
                        label: 'About us config',
                        icon: '',
                        routerLink: ['/uikit/aboutus']
                    },
                    {
                        label: 'Our team',
                        icon: '',
                        routerLink: ['']
                    }
                ]
            },
            {
                label: 'Reports and forms configuration',
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
