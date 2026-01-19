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
        // const sideRoutesString = localStorage.getItem('sideRoutes');
        // if (sideRoutesString) {
        //     const sideRouts = JSON.parse(sideRoutesString);

        //     this.model = sideRouts.map((route: any) => {
        //         return {
        //             label: route.name, // مثلاً "website control"
        //             items: route.children.map((child: any) => ({
        //                 label: child.name,
        //                 icon: '',
        //                 routerLink: [child.pageUrl]
        //             }))
        //         };
        //     });
        // }
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
                    { label: 'Add Patient report', icon: '', routerLink: ['/uikit/patientreport'] },
                    {
                        label: 'Add treatment plan',
                        icon: '',
                        routerLink: ['/uikit/phases-sessions']
                    },

                    {
                        label: 'Tracking session attendance',
                        icon: '',
                        routerLink: ['/uikit/trackingattendance']
                    },
                    {
                        label: 'Working hours',
                        icon: '',
                        routerLink: ['/uikit/workinghours']
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
                    // {
                    //     label: 'Hero Section Config',
                    //     icon: '',
                    //     routerLink: ['/uikit/herosectionconfig']
                    // },
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
                        label: 'Knowledge hub page config',
                        icon: '',
                        routerLink: ['/uikit/knowledgehub']
                    },
                    {
                        label: 'Our solutions section config',
                        icon: '',
                        routerLink: ['/uikit/oursolutions']
                    },
                    {
                        label: 'Our partners section config',
                        icon: '',
                        routerLink: ['/uikit/partners']
                    },

                    {
                        label: 'Success Stories section config',
                        icon: '',
                        routerLink: ['/uikit/successstories']
                    },

                    // {
                    //     label: 'Contact us section config',
                    //     icon: '',
                    //     routerLink: ['/uikit/contactus']
                    // },
                    // {
                    //     label: 'About us config',
                    //     icon: '',
                    //     routerLink: ['/uikit/aboutus']
                    // },
                    {
                        label: 'Our team',
                        icon: '',
                        routerLink: ['/uikit/our-team']
                    }
                ]
            },
            {
                label: 'Measurements configuration',
                items: [
                    {
                        label: 'measurements configuration',
                        icon: '',
                        routerLink: ['/uikit/measurements-config']
                    }
                ]
            }
            // {
            //     label: 'Reports and forms configuration',
            //     items: [
            //         {
            //             label: 'reports',
            //             icon: '',
            //             routerLink: ['/uikit/reportconfig']
            //         }
            //     ]
            // }
        ];
    }
}
