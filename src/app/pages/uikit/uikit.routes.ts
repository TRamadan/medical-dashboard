import { Routes } from '@angular/router';
import { AddUserComponent } from './add-user/add-user.component';
import { AddGroupComponent } from './add-group/add-group.component';
import { AddPermissionComponent } from './add-permission/add-permission.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { AddServiceComponent } from './add-service/add-service.component';
import { AddLocationComponent } from './add-location/add-location.component';
export default [
    {
        path: 'adduser',
        data: { breadcrumb: 'Add user' },
        component: AddUserComponent
    },
    {
        path: 'addgroup',
        data: { breadcrumb: 'Add group' },
        component: AddGroupComponent
    },
    {
        path: 'addpermission',
        data: { breadcrumb: 'Add permission' },
        component: AddPermissionComponent
    },
    {
        path: 'appointments',
        data: { breadcrumb: 'Appointments' },
        component: AppointmentsComponent
    },
    {
        path: 'services',
        data: { breadcrumb: 'Services' },
        component: AddServiceComponent
    },
    {
        path: 'location',
        data: { breadcrumb: 'Locations' },
        component: AddLocationComponent
    }
] as Routes;
