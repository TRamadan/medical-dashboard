export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  /** Interval multiplier: every N days/weeks/months */
  interval: number;
  /** For weekly: 0 = Sunday .. 6 = Saturday */
  daysOfWeek: number[];
  /** For monthly: day of month, 1-31 */
  dayOfMonth: number | null;
  time: string; // "HH:mm", 24h
  startDate: string; // ISO date, yyyy-MM-dd
  endMode: 'never' | 'onDate' | 'afterCount';
  endDate: string | null;
  occurrenceCount: number | null;
}

export interface UserType {
  id: string;
  name: string;
}

export interface AudienceUser {
  id: string;
  name: string;
  email?: string;
  userTypeId: string; // links this user to a UserType.id
}

export interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  estimatedSize: number;
}

export interface NotificationTrigger {
  id: string;
  title: string;
  message: string;
  recurrence: RecurrenceRule;
  audienceSegmentIds: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
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
    frequency: 'weekly',
    interval: 1,
    daysOfWeek: [today.getDay()],
    dayOfMonth: today.getDate(),
    time: '09:00',
    startDate: iso,
    endMode: 'never',
    endDate: null,
    occurrenceCount: null,
  };
}
