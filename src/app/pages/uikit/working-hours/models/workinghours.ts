export interface Workinghours {
    doctorId: number;
    locationId: number;
    serviceIds: number[];
    slots: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
    }[];
}
