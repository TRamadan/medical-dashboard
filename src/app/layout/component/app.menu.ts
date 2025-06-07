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
                        label: 'Add permission',
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
                    { label: 'Add treatment plan', icon: '', routerLink: ['/uikit/treatementplan'] },
                    {
                        label: 'Tracking session attendance',
                        icon: '',
                        routerLink: ['/uikit/trackingattendance']
                    },
                    {
                        label: 'Calendar',
                        icon: '',
                        routerLink: ['/uikit/calendar']
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
            }
        ];
    }
}
