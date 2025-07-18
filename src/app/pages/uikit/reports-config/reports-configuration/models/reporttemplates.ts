export interface ReportTemplateDetails {
    id: number;
    name: string;
}

export interface SubCategory {
    id: number;
    name: string;
}

export interface Reporttemplates {
    id: number;
    name: string;
    reportColumns?: string;
    reportTemplate?: { id: number; name: string };
    reportTemplateDetails: ReportTemplateDetails[];
    subCategories?: SubCategory[];
    templateName?: string;
    isSavedForLater?: boolean;
    createdAt?: Date;
}
