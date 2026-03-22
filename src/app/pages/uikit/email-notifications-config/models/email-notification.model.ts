export interface EmailPlaceholder {
  key: string;
  value: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export interface NotificationPayload {
  title: string;
  message: string;
  type: string;
}
