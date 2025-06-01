export interface Services {
    id?: number;
    name?: string;
    numberOfsubCatrgories: number;
    subCategories: SubCategory[];
}

export interface SubCategory {
    id?: number;
    name?: string;
    isShownWebSite?: boolean;
    appointmentRecurringDuration?: number;
    duration?: number;
    price?: number;
    BufferTimeBefore?: number;
    BuferTimeAfter?: number;
    MaxCapacity?: number;
    LowerCapacity?: number;
}
