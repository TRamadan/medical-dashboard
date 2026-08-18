import { Injectable, computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  AudienceSegment,
  NotificationTrigger,
  defaultRecurrenceRule,
} from '../models/notification-trigger.model';

const MOCK_SEGMENTS: AudienceSegment[] = [
  { id: 'seg-all', name: 'All users', description: 'Everyone with notifications enabled', estimatedSize: 128_400 },
  { id: 'seg-trial', name: 'Trial accounts', description: 'Active trial, not yet converted', estimatedSize: 6_120 },
  { id: 'seg-paid', name: 'Paid subscribers', description: 'Any active paid plan', estimatedSize: 41_950 },
  { id: 'seg-inactive-30', name: 'Inactive 30+ days', description: 'No session in the last 30 days', estimatedSize: 18_760 },
  { id: 'seg-eu', name: 'EU region', description: 'Primary region set to EU', estimatedSize: 22_300 },
  { id: 'seg-beta', name: 'Beta testers', description: 'Opted into the beta program', estimatedSize: 3_040 },
];

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

@Injectable({ providedIn: 'root' })
export class NotificationTriggerService {
  private readonly _segments = signal<AudienceSegment[]>(MOCK_SEGMENTS);
  private readonly _triggers = signal<NotificationTrigger[]>(seedTriggers());

  readonly segments = this._segments.asReadonly();
  readonly triggers = this._triggers.asReadonly();

  readonly activeCount = computed(() => this._triggers().filter((t) => t.active).length);

  getSegmentsByIds(ids: string[]): AudienceSegment[] {
    const idSet = new Set(ids);
    return this._segments().filter((s) => idSet.has(s.id));
  }

  estimateAudienceSize(ids: string[]): number {
    // Segments can overlap in real systems; for this mock we sum with a
    // simple dedupe-by-id and no cross-segment overlap correction.
    return this.getSegmentsByIds(ids).reduce((sum, s) => sum + s.estimatedSize, 0);
  }

  createTrigger(input: Omit<NotificationTrigger, 'id' | 'createdAt' | 'updatedAt'>): Observable<NotificationTrigger> {
    const now = new Date().toISOString();
    const trigger: NotificationTrigger = { ...input, id: uid('trig'), createdAt: now, updatedAt: now };
    this._triggers.update((list) => [trigger, ...list]);
    return of(trigger).pipe(delay(150));
  }

  updateTrigger(id: string, changes: Partial<NotificationTrigger>): Observable<NotificationTrigger | null> {
    let updated: NotificationTrigger | null = null;
    this._triggers.update((list) =>
      list.map((t) => {
        if (t.id !== id) return t;
        updated = { ...t, ...changes, id: t.id, updatedAt: new Date().toISOString() };
        return updated;
      })
    );
    return of(updated).pipe(delay(150));
  }

  toggleActive(id: string): void {
    this._triggers.update((list) =>
      list.map((t) => (t.id === id ? { ...t, active: !t.active, updatedAt: new Date().toISOString() } : t))
    );
  }

  deleteTrigger(id: string): void {
    this._triggers.update((list) => list.filter((t) => t.id !== id));
  }
}

function seedTriggers(): NotificationTrigger[] {
  const now = new Date().toISOString();
  return [
    {
      id: uid('trig'),
      title: 'Weekly digest',
      message: 'Your weekly summary is ready to view.',
      recurrence: { ...defaultRecurrenceRule(), frequency: 'weekly', daysOfWeek: [1], time: '08:00' },
      audienceSegmentIds: ['seg-all'],
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uid('trig'),
      title: 'Trial ending reminder',
      message: 'Your trial ends soon — upgrade to keep your data.',
      recurrence: { ...defaultRecurrenceRule(), frequency: 'daily', interval: 3, time: '10:30' },
      audienceSegmentIds: ['seg-trial'],
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uid('trig'),
      title: 'Win-back nudge',
      message: 'We miss you. Here is what is new since your last visit.',
      recurrence: { ...defaultRecurrenceRule(), frequency: 'monthly', dayOfMonth: 1, time: '09:00' },
      audienceSegmentIds: ['seg-inactive-30'],
      active: false,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
