import type { Trip } from '../../entities';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export type TripDaySection = {
  key: string;
  title: string;
  trips: Trip[];
};

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function dayTitle(date: Date, now: Date): string {
  return formatDayTitle(date, now);
}

// "Today", "Yesterday" or e.g. "Mon 19 Oct".
export function formatDayTitle(date: Date, now: Date): string {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - day.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

// Groups trips into calendar-day sections titled "Today", "Yesterday" or
// e.g. "Mon 19 Oct", preserving the incoming trip order (newest first).
export function groupTripsByDay(trips: readonly Trip[], now: Date): TripDaySection[] {
  const sections: TripDaySection[] = [];
  const byKey = new Map<string, TripDaySection>();
  for (const trip of trips) {
    const date = new Date(trip.startedAt);
    const key = dayKey(date);
    let section = byKey.get(key);
    if (section === undefined) {
      section = { key, title: dayTitle(date, now), trips: [] };
      byKey.set(key, section);
      sections.push(section);
    }
    section.trips.push(trip);
  }
  return sections;
}
