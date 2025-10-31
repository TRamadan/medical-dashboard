import { Component, TemplateRef, ViewChild } from '@angular/core';
import { TabsComponent, TabItem } from '../../../shared/tabs/tabs.component';
import { ReportsConfigurationComponent } from './reports-configuration/reports-configuration.component';
import { CardModule } from 'primeng/card';
import { PatientsReportComponent } from './patients-report/patients-report.component';
import { ReservationFormConfigurationComponent } from './reservation-form-configuration/reservation-form-configuration.component';
import { ReportsCategoryComponent } from './reports-category/reports-category.component';
@Component({
    selector: 'app-reports-config',
    imports: [CardModule, TabsComponent, ReportsConfigurationComponent, PatientsReportComponent, ReservationFormConfigurationComponent, ReportsCategoryComponent],
    templateUrl: './reports-config.component.html',
    styleUrl: './reports-config.component.css'
})
export class ReportsConfigComponent {
    chooseConfigType: any;
    categoryDialog: boolean = false;
    reportsDialog: boolean = false;
    @ViewChild('Customers') formConfigTab!: TemplateRef<any>;
    @ViewChild('Employees') reportsConfigTab!: TemplateRef<any>;
    @ViewChild('usersReportsTab') usersReportsTab!: TemplateRef<any>;
    @ViewChild('reportsCategoriesConfigTab') reportsCategoriesConfigTab!: TemplateRef<any>;
    @ViewChild(ReportsCategoryComponent) reportsCategory!: ReportsCategoryComponent;

    configArr: any[] = [
        {
            id: 1,
            name: 'Reports Categories and sub categories config',
            type: 'category'
        },
        {
            id: 2,
            name: 'Add new report config',
            type: 'report'
        }
    ];

    selecteConfigType(choosedConfig: any): void {
        this.chooseConfigType = choosedConfig;
        if (choosedConfig.type === 'category') {
            this.reportsCategory.openAddCategoryDialog();
        } else {
        }
    }
}
