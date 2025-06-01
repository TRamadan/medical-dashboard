import { Routes } from '@angular/router';
import { AgencyComponent } from './agency/agency.component';
import { AgencyTypeComponent } from './agency-type/agency-type.component';
import { DivisionComponent } from './division/division.component';
import { VehicleTypeComponent } from './vehicle-type/vehicle-type.component';
import { TypeLayerComponent } from './type-layer/type-layer.component';
import { RoadIslandComponent } from './road-island/road-island.component';
import { RoadGradeComponent } from './road-grade/road-grade.component';
import { GovernorateComponent } from './Governorate/Governorate.component';
import { GeoDataFileCategoryComponent } from './geo-data-file-category/geo-data-file-category.component';

export default [
    {
        path: 'agency',
        data: { breadcrumb: 'Agency' },
        component: AgencyComponent
    },
    {
        path: 'agencyType',
        data: { breadcrumb: 'Agency' },
        component: AgencyTypeComponent
    },

    {
        path: 'division',
        data: { breadcrumb: 'Agency' },
        component: DivisionComponent
    },

    {
        path: 'vehicleType',
        data: { breadcrumb: 'Agency' },
        component: VehicleTypeComponent
    },

    {
        path: 'typeLayer',
        data: { breadcrumb: 'type layer' },
        component: TypeLayerComponent
    },

    {
        path: 'roadIsland',
        data: { breadcrumb: 'road island' },
        component: RoadIslandComponent
    },
    {
        path: 'roadGrade',
        data: { breadcrumb: 'road grade' },
        component: RoadGradeComponent
    },
    {
        path: 'govs',
        data: { breadcrumb: 'governorates' },
        component: GovernorateComponent
    },
    {
        path: 'geodatafilecategory',
        data: { breadcrumb: 'geodatafilecategory' },
        component: GeoDataFileCategoryComponent
    }
    // { path: 'button', data: { breadcrumb: 'Button' }, component: ButtonDemo },
    // { path: 'charts', data: { breadcrumb: 'Charts' }, component: ChartDemo },
    // { path: 'file', data: { breadcrumb: 'File' }, component: FileDemo },
    // { path: 'formlayout', data: { breadcrumb: 'Form Layout' }, component: FormLayoutDemo },
    // { path: 'input', data: { breadcrumb: 'Input' }, component: InputDemo },
    // { path: 'list', data: { breadcrumb: 'List' }, component: ListDemo },
    // { path: 'media', data: { breadcrumb: 'Media' }, component: MediaDemo },
    // { path: 'message', data: { breadcrumb: 'Message' }, component: MessagesDemo },
    // { path: 'misc', data: { breadcrumb: 'Misc' }, component: MiscDemo },
    // { path: 'panel', data: { breadcrumb: 'Panel' }, component: PanelsDemo },
    // { path: 'timeline', data: { breadcrumb: 'Timeline' }, component: TimelineDemo },
    // { path: 'table', data: { breadcrumb: 'Table' }, component: TableDemo },
    // { path: 'overlay', data: { breadcrumb: 'Overlay' }, component: OverlayDemo },
    // { path: 'menu', data: { breadcrumb: 'Menu' }, component: MenuDemo },
] as Routes;
