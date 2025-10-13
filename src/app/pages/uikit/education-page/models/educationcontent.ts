export interface Education {
    id?: number;
    categoryId?: number;
    title?: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    img?: string;
    createdBy?: string;
    isArticle?: boolean;
    videoUrl?: string;
}

export interface Category {
    id?: number;
    nameAr?: string;
    nameEn?: string;
}

export interface Researches {
    id?: string;
    titleAr?: string;
    titleEn?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    link?: string;
}

export interface Exercises {
    id?: number | null | any;
    titleAr?: string;
    titleEn?: string;
    file?: string;
}
