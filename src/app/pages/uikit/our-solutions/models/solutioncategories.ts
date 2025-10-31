export interface Solutioncategories {
    id: number;
    nameEn: string;
    nameAr: string;
}

export interface Solution {
    img: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    link: string;
    solutionCategoryId: number;
}
