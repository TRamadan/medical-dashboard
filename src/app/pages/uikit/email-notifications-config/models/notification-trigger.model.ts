export type RecurrenceFrequency = 1 | 2 | 3; // 1: Daily, 2: Weekly, 3: Monthly
export type EndType = 1 | 2 | 3; // 1: Never, 2: OnDate, 3: AfterOccurrences

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  /** Interval multiplier: every N days/weeks/months */
  interval: number;
  /** For weekly: 0 = Sunday .. 6 = Saturday (.NET DayOfWeek) */
  daysOfWeek: number[];
  /** For monthly: day of month, 1-31 */
  dayOfMonth: number | null;
  time: string; // "HH:mm" or "HH:mm:ss", 24h local clinic time
  startDate: string; // ISO date, yyyy-MM-dd
  endMode: EndType;
  endDate: string | null; // ISO date yyyy-MM-dd when endMode = 2
  occurrenceCount: number | null; // maxOccurrences when endMode = 3
}

export interface NotificationTriggerTypeOption {
  id: number;
  name: string;
  label?: string;
}

export interface AudienceOption {
  id: number;
  name: string;
}

export interface AudienceUserItem {
  id: number;
  name: string;
  email?: string;
  employeeTypeId?: number;
}

export interface NotificationTriggerListItem {
  id: number;
  isActive: boolean;
  title: string;
  typeLabel?: string;
  scheduleLabel?: string;
  audienceLabel?: string;
}

export interface NotificationTriggerListResponse {
  activeCount: number;
  totalCount: number;
  triggers: NotificationTriggerListItem[];
}

export interface NotificationTriggerPayload {
  title: string;
  message: string;
  type: number;
  frequency: number;
  interval: number;
  daysOfWeek: number[] | null;
  dayOfMonth: number | null;
  timeOfDay: string;
  startDate: string;
  endType: number;
  endDate: string | null;
  maxOccurrences: number | null;
  audienceEmployeeTypeIds: number[];
  includePatients: boolean;
  recipientUserIds: number[];
  isActive: boolean;
}

export interface NotificationTriggerDetail extends NotificationTriggerPayload {
  id: number;
  typeLabel?: string;
  scheduleLabel?: string;
  audienceLabel?: string;
  recipients?: { id: number; name: string; email?: string }[];
  occurrenceCount?: number;
  lastRunAt?: string | null;
}

export const DAY_LABELS: { value: number; short: string; full: string }[] = [
  { value: 0, short: 'Su', full: 'Sunday' },
  { value: 1, short: 'Mo', full: 'Monday' },
  { value: 2, short: 'Tu', full: 'Tuesday' },
  { value: 3, short: 'We', full: 'Wednesday' },
  { value: 4, short: 'Th', full: 'Thursday' },
  { value: 5, short: 'Fr', full: 'Friday' },
  { value: 6, short: 'Sa', full: 'Saturday' },
];

export function defaultRecurrenceRule(): RecurrenceRule {
  const today = new Date();
  const iso = today.toISOString().slice(0, 10);
  return {
    frequency: 2, // Weekly
    interval: 1,
    daysOfWeek: [today.getDay()], // Sunday = 0
    dayOfMonth: today.getDate(),
    time: '08:00:00',
    startDate: iso,
    endMode: 1, // Never
    endDate: null,
    occurrenceCount: null,
  };
}

