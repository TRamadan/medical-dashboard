export enum NotificationType {
    AppointmentBooked = 1,
    ProfileDataCompleted = 2,
    AppointmentPaid = 3,
    AppointmentCancelled = 4,
    AppointmentRescheduled = 5,
    ReviseAppointmentReady = 6,
    PlanAppointmentReady = 7,
    ReferralReminder2Days = 8,
    ReferralReminder5Days = 9,
    ReferralEscalated = 10,
    ReferralCancelled = 11,
    ProtocolModificationPending = 12,
    LowNPSAlert = 13,
    NegativeSessionFeedback = 14,
    LowBlueprintRating = 15,
    NoticeableImprovement = 16
}

export interface NotificationDTO {
    id: number;
    titleEn: string;
    titleAr: string;
    messageEn: string;
    messageAr: string;
    type: NotificationType;
    isRead: boolean;
    relatedEntityType: string | null;
    relatedEntityId: number | null;
    createdAt: string;
}

export interface PaginatedNotificationsResponse {
    items: NotificationDTO[];
    totalCount: number;
    page: number;
    pageSize: number;
}
