export interface Reporttemplates {
    id?: number;
    name?: string;
    reportTemplateDetails: ReportTemplateDetails[]
}

export interface ReportTemplateDetails {
    id: number;
    name: string;
}
