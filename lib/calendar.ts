/** Pure calendar logic: month grids, date keys and event management (no timezone surprises: dates are local "YYYY-MM-DD" keys). */

export type DayCell = { key: string; day: number; inMonth: boolean };
export type CalendarEvent = { id: string; date: string; title: string; time?: string };

const pad = (n: number) => String(n).padStart(2, "0");

/** month is 0-based (0 = January), like Date. */
export function dateKey(year: number, month: number, day: number): string {
  const d = new Date(year, month, day);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayKey(now = new Date()): string {
  return dateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Shift a {year, month} by `delta` months, normalising across year boundaries. */
export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const total = year * 12 + month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}

/**
 * Six full weeks (42 cells) covering the month, padded with days from the
 * neighbouring months. `weekStartsOn`: 0 = Sunday, 1 = Monday.
 */
export function buildMonthGrid(year: number, month: number, weekStartsOn: 0 | 1 = 0): DayCell[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const offset = (firstWeekday - weekStartsOn + 7) % 7;
  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(year, month, 1 - offset + i);
    cells.push({
      key: dateKey(d.getFullYear(), d.getMonth(), d.getDate()),
      day: d.getDate(),
      inMonth: d.getMonth() === month,
    });
  }
  return cells;
}

export function weekdayLabels(weekStartsOn: 0 | 1 = 0): string[] {
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return [...names.slice(weekStartsOn), ...names.slice(0, weekStartsOn)];
}

export function monthTitle(year: number, month: number): string {
  const names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${names[month]} ${year}`;
}

export function isValidTime(time: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

export type NewEventInput = { date: string; title: string; time?: string };

export function validateEvent(input: NewEventInput): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return "Pick a date";
  if (!input.title.trim()) return "Title is required";
  if (input.title.trim().length > 80) return "Title must be 80 characters or fewer";
  if (input.time && !isValidTime(input.time)) return "Time must be HH:MM (24-hour)";
  return null;
}

/** All-day events first, then by time, then title. */
export function eventsOn(events: CalendarEvent[], date: string): CalendarEvent[] {
  return events
    .filter((e) => e.date === date)
    .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? "") || a.title.localeCompare(b.title));
}

export function countByDate(events: CalendarEvent[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of events) m.set(e.date, (m.get(e.date) ?? 0) + 1);
  return m;
}

export function addEvent(events: CalendarEvent[], input: NewEventInput, id: string): CalendarEvent[] {
  const error = validateEvent(input);
  if (error) throw new Error(error);
  const event: CalendarEvent = { id, date: input.date, title: input.title.trim() };
  if (input.time) event.time = input.time;
  return [...events, event];
}

export function removeEvent(events: CalendarEvent[], id: string): CalendarEvent[] {
  return events.filter((e) => e.id !== id);
}

/** Type guard used when loading events from local storage. */
export function isCalendarEvent(value: unknown): value is CalendarEvent {
  if (typeof value !== "object" || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(e.date) &&
    typeof e.title === "string" &&
    e.title.trim().length > 0 &&
    (e.time === undefined || (typeof e.time === "string" && (e.time === "" || isValidTime(e.time))))
  );
}
