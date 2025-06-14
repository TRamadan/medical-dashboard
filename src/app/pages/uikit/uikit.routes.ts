import { Routes } from '@angular/router';
import { AddUserComponent } from './add-user/add-user.component';
import { AddGroupComponent } from './add-group/add-group.component';
import { AddPermissionComponent } from './add-permission/add-permission.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { AddServiceComponent } from './add-service/add-service.component';
import { AddLocationComponent } from './add-location/add-location.component';
import { CalendarComponent } from './calendar/calendar.component';
import { AttendanceTrackingComponent } from './attendance-tracking/attendance-tracking.component';
import { SessionManagementComponent } from './session-management/session-management.component';
import { CoachManagerComponent } from './coach-manager/coach-manager.component';
import { TreatmentPlanComponent } from './treatment-plan/treatment-plan.component';
export default [
    {
        path: 'adduser',
        data: { breadcrumb: 'Add user' },
        component: AddUserComponent
    },
    {
        path: 'trackingattendance',
        data: { breadcrumb: 'Tracking session attendance' },
        component: AttendanceTrackingComponent
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
    },
    {
        path: 'calendar',
        data: { breadcrumb: 'Caledar' },
        component: CalendarComponent
    },
    {
        path: 'sessionmanagement',
        data: { breadcrumb: 'Caledar' },
        component: SessionManagementComponent
    },
    {
        path: 'coachmanagement',
        data: { breachcrumb: 'Coach management' },
        component: CoachManagerComponent
    },
    {
        path: 'treatmentplan',
        data: { breadcrumb: 'Treatment plan' },
        component: TreatmentPlanComponent
    }
] as Routes;
