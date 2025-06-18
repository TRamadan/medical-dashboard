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
import { SuperStarsComponent } from './super-stars/super-stars.component';
import { PartnersComponent } from './partners/partners.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { EducationalVideosComponent } from './educational-videos/educational-videos.component';
import { OurServicesComponent } from './our-services/our-services.component';
import { OurTeamComponent } from './our-team/our-team.component';
import { JoinOurTeamComponent } from './join-our-team/join-our-team.component';
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
    },
    {
        path: 'superstars',
        data: { breadcrumb: 'super stars' },
        component: SuperStarsComponent
    },
    {
        path: 'partners',
        data: { breadcrumb: 'Partners' },
        component: PartnersComponent
    },
    {
        path: 'aboutus',
        data: { breadcrumb: 'About us' },
        component: AboutUsComponent
    },
    {
        path: 'educationalvideos',
        data: { breadcrumb: 'Educational videos' },
        component: EducationalVideosComponent
    },
    {
        path: 'ourservices',
        data: { breadcrumb: 'Our services' },
        component: OurServicesComponent
    },
    {
        path: 'ourteam',
        data: { breadcrumb: 'Our team' },
        component: OurTeamComponent
    },
    {
        path: 'joinus',
        data: { breadcrumb: 'Join us' },
        component: JoinOurTeamComponent
    },
    {
        path: 'contactus',
        data: { breadcrumb: 'Join us' },
        component: JoinOurTeamComponent
    }
] as Routes;
