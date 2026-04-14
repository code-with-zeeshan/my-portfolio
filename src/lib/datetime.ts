// src/lib/datetime.ts

export function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  // Shift so toISOString outputs local "clock time" for the datetime-local input
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function datetimeLocalToIso(local: string): string | null {
  if (!local) return null;
  // new Date("YYYY-MM-DDTHH:mm") is interpreted as LOCAL time in all modern browsers
  return new Date(local).toISOString();
}

// returns a short timezone label e.g. "IST", "EST", "PST"
// Used to show users which timezone the schedule picker is using
export function getUserTimezoneLabel(): string {
  try {
    // e.g. "Asia/Kolkata" → try to get short abbreviation
    const full = Intl.DateTimeFormat().resolvedOptions().timeZone; // "Asia/Kolkata"
    const short = new Intl.DateTimeFormat("en", { timeZoneName: "short" })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value ?? full;
    return short; // "IST", "GMT+5:30", etc.
  } catch {
    return "local time";
  }
}

// formats an ISO string for human display in user's local timezone
export function formatScheduledDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", {
    month:  "short",
    day:    "numeric",
    year:   "numeric",
    hour:   "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}