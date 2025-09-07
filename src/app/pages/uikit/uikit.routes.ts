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
import { ReportsConfigComponent } from './reports-config/reports-config.component';
import { CertificationsComponent } from './certifications/certifications.component';
import { SpecialitiesComponent } from './specialities/specialities.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { CuttingEdgeTechnologyComponent } from './cutting-edge-technology/cutting-edge-technology.component';
import { MethodologyComponent } from './methodology/methodology.component';
import { HeroSectionConfigComponent } from './hero-section-config/hero-section-config.component';
import { BenefitsComponent } from './benefits/benefits.component';
import { SuccessStoreisComponent } from './success-storeis/success-storeis.component';
import { HowItWorksComponent } from './how-it-works/how-it-works.component';
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
        path: 'herosectionconfig',
        component: HeroSectionConfigComponent
    },
    {
        path: 'superstars',
        component: SuperStarsComponent
    },
    {
        path: 'Methodology',
        component: MethodologyComponent
    },
    {
        path: 'benefits',
        component: BenefitsComponent
    },
    {
        path: 'partners',
        component: PartnersComponent
    },

    // {
    //     path: 'inovationHub',
    //     component: CuttingEdgeTechnologyComponent
    // },
    {
        path: 'successstories',
        component: SuccessStoreisComponent
    },
    {
        path: 'howitworks',
        component: HowItWorksComponent
    },
    {
        path: 'contactus',
        component: ContactUsComponent
    },
    {
        path: 'aboutus',
        component: AboutUsComponent
    },
    {
        path: 'reportconfig',
        component: ReportsConfigComponent
    },
    {
        path: 'our-team',
        component: OurTeamComponent
    }
] as Routes;
