export interface Services {
    id?: number;
    titleAr: string;
    ttileEn: string;
    descriptionAr: string;
    descriptionEn: string;
    details: Details[];
}

export interface Details {
    id?: number;
    nameAr: string;
    nameEn: string;
}

export interface SubServices extends Details {}
