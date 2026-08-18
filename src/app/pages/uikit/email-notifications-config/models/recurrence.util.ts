import { RecurrenceRule } from './notification-trigger.model';

/**
 * Computes the next `count` occurrences for a recurrence rule, starting
 * from `from` (defaults to now). Pure function, no side effects, so it can
 * drive a live preview as the user edits the form.
 */
export function computeNextOccurrences(
  rule: RecurrenceRule,
  count: number,
  from: Date = new Date()
): Date[] {
  const results: Date[] = [];
  const [hh, mm] = rule.time.split(':').map((v) => parseInt(v, 10) || 0);

  const start = new Date(rule.startDate + 'T00:00:00');
  const rangeEndDate =
    rule.endMode === 'onDate' && rule.endDate ? new Date(rule.endDate + 'T23:59:59') : null;

  let cursor = new Date(Math.max(start.getTime(), stripTime(from).getTime()));
  let occurrencesSoFar = 0;
  let guard = 0; // safety valve against infinite loops on bad input

  while (results.length < count && guard < 5000) {
    guard++;

    if (rangeEndDate && cursor.getTime() > rangeEndDate.getTime()) break;
    if (rule.endMode === 'afterCount' && rule.occurrenceCount != null && occurrencesSoFar >= rule.occurrenceCount) {
      break;
    }

    if (matchesRule(cursor, rule, start)) {
      const candidate = new Date(cursor);
      candidate.setHours(hh, mm, 0, 0);
      occurrencesSoFar++;

      if (rule.endMode === 'afterCount' && rule.occurrenceCount != null && occurrencesSoFar > rule.occurrenceCount) {
        break;
      }
      if (candidate.getTime() >= from.getTime()) {
        results.push(candidate);
      }
    }

    cursor = addDays(cursor, 1);
  }

  return results;
}

function matchesRule(date: Date, rule: RecurrenceRule, start: Date): boolean {
  const interval = Math.max(1, rule.interval || 1);

  if (rule.frequency === 'daily') {
    const diffDays = diffInDays(start, date);
    return diffDays >= 0 && diffDays % interval === 0;
  }

  if (rule.frequency === 'weekly') {
    if (!rule.daysOfWeek.length) return false;
    if (!rule.daysOfWeek.includes(date.getDay())) return false;
    const startWeek = startOfWeek(start);
    const thisWeek = startOfWeek(date);
    const diffWeeks = Math.round(diffInDays(startWeek, thisWeek) / 7);
    return diffWeeks >= 0 && diffWeeks % interval === 0;
  }

  if (rule.frequency === 'monthly') {
    const day = rule.dayOfMonth ?? start.getDate();
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const effectiveDay = Math.min(day, lastDayOfMonth);
    if (date.getDate() !== effectiveDay) return false;
    const diffMonths = (date.getFullYear() - start.getFullYear()) * 12 + (date.getMonth() - start.getMonth());
    return diffMonths >= 0 && diffMonths % interval === 0;
  }

  return false;
}

function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function diffInDays(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((stripTime(b).getTime() - stripTime(a).getTime()) / msPerDay);
}

function startOfWeek(d: Date): Date {
  const copy = stripTime(d);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

/** Human-readable one-line summary of a recurrence rule, e.g. "Every 2 weeks on Mon, Wed at 09:00". */
export function describeRecurrence(rule: RecurrenceRule): string {
  const interval = Math.max(1, rule.interval || 1);
  const time = rule.time;

  let base: string;
  if (rule.frequency === 'daily') {
    base = interval === 1 ? 'Every day' : `Every ${interval} days`;
  } else if (rule.frequency === 'weekly') {
    const days = [...rule.daysOfWeek].sort((a, b) => a - b);
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayList = days.length ? days.map((d) => names[d]).join(', ') : 'no days selected';
    base = interval === 1 ? `Every week on ${dayList}` : `Every ${interval} weeks on ${dayList}`;
  } else {
    const day = rule.dayOfMonth ?? 1;
    base = interval === 1 ? `Every month on day ${day}` : `Every ${interval} months on day ${day}`;
  }

  let tail = ` at ${time}`;
  if (rule.endMode === 'onDate' && rule.endDate) {
    tail += `, until ${rule.endDate}`;
  } else if (rule.endMode === 'afterCount' && rule.occurrenceCount) {
    tail += `, for ${rule.occurrenceCount} sends`;
  }

  return base + tail;
}
