import type { Weekday } from "./types";
import { WEEKDAYS } from "./types";

/**
 * Dates and money, in West Africa Time.
 *
 * Nigeria is UTC+1 and **observes no DST**, which is what makes a fixed offset
 * exactly correct here rather than merely convenient — there is no date on which
 * WAT is anything other than UTC+1. Arithmetic below uses that offset; `Intl`
 * (with an explicit Africa/Lagos zone) is used only for display strings.
 *
 * If Lumora ever supports a second timezone, every function taking a bare
 * epoch/date pair needs the business's `timezone` threaded through it and this
 * constant has to go. That is the one migration this module is hiding.
 */
const WAT_OFFSET_MS = 60 * 60 * 1000;

export const WAT_TIMEZONE = "Africa/Lagos";

/* ── Conversion ─────────────────────────────────────────────────────────── */

/** `"2026-08-25"` + `"14:30"`, read as WAT wall-clock, to epoch ms. */
export function fromWatDateTime(dateKey: string, time: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return Date.UTC(year, month - 1, day, hour, minute) - WAT_OFFSET_MS;
}

/** Epoch ms to the WAT calendar day it falls on, `"2026-08-25"`. */
export function watDateKey(ms: number): string {
  return new Date(ms + WAT_OFFSET_MS).toISOString().slice(0, 10);
}

/** Epoch ms to WAT wall-clock `"14:30"`. */
export function watTimeKey(ms: number): string {
  return new Date(ms + WAT_OFFSET_MS).toISOString().slice(11, 16);
}

/** Midnight WAT on the given day, as epoch ms. */
export function watDayStart(dateKey: string): number {
  return fromWatDateTime(dateKey, "00:00");
}

/** Which weekday `"2026-08-25"` is, for looking up opening hours. */
export function watWeekday(dateKey: string): Weekday {
  const day = new Date(`${dateKey}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  return WEEKDAYS[(day + 6) % 7]; // shift so Monday is index 0
}

/** `"2026-08-25"` shifted by whole days, staying on the WAT calendar. */
export function addWatDays(dateKey: string, days: number): string {
  return watDateKey(watDayStart(dateKey) + days * 24 * 60 * 60 * 1000);
}

/* ── Minutes-since-midnight ─────────────────────────────────────────────── */

/** `"09:30"` -> `570`. Returns null for anything that isn't `HH:MM`. */
export function parseHhMm(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  return hours * 60 + minutes;
}

/** `570` -> `"09:30"`. */
export function toHhMm(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/* ── Month ranges, for the dashboard ────────────────────────────────────── */

export type MonthRange = {
  /** Inclusive. */
  start: number;
  /** Exclusive. */
  end: number;
  /** Short label for a chart axis, e.g. "Aug". */
  label: string;
};

/**
 * The WAT calendar month containing `ms`, offset by whole months.
 * `watMonthRange(now, -1)` is last month.
 */
export function watMonthRange(ms: number, offsetMonths = 0): MonthRange {
  const local = new Date(ms + WAT_OFFSET_MS);
  const year = local.getUTCFullYear();
  const month = local.getUTCMonth() + offsetMonths;

  const start = Date.UTC(year, month, 1) - WAT_OFFSET_MS;
  const end = Date.UTC(year, month + 1, 1) - WAT_OFFSET_MS;

  return { start, end, label: MONTH_FORMAT.format(start) };
}

/** The last `count` WAT months ending with the one containing `ms`, oldest first. */
export function recentWatMonths(ms: number, count: number): MonthRange[] {
  return Array.from({ length: count }, (_, index) =>
    watMonthRange(ms, index - (count - 1)),
  );
}

/* ── Display ────────────────────────────────────────────────────────────── */

const MONTH_FORMAT = new Intl.DateTimeFormat("en-NG", {
  month: "short",
  timeZone: WAT_TIMEZONE,
});

const DATE_FORMAT = new Intl.DateTimeFormat("en-NG", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: WAT_TIMEZONE,
});

const DATE_LONG_FORMAT = new Intl.DateTimeFormat("en-NG", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: WAT_TIMEZONE,
});

const TIME_FORMAT = new Intl.DateTimeFormat("en-NG", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: WAT_TIMEZONE,
});

/** "Tue 25 Aug" */
export function formatWatDate(ms: number): string {
  return DATE_FORMAT.format(ms);
}

/** "Tuesday 25 August" */
export function formatWatDateLong(ms: number): string {
  return DATE_LONG_FORMAT.format(ms);
}

/** "2:30 pm" */
export function formatWatTime(ms: number): string {
  return TIME_FORMAT.format(ms).toLowerCase();
}
