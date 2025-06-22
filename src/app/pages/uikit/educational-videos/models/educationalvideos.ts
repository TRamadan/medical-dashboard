export interface Educationalvideos {
    id?: number;
    videoUrl?: string;
    title?: string;
    videoCategory: string; //excercise, recovery, nutrition
}

export interface VideoCategory {
    id?: number;
    nameAr: string;
    nameEn: string;
}
