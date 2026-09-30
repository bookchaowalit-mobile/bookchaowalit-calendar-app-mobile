import { describe, expect, it } from "vitest";
import {
  addEvent,
  addMonths,
  buildMonthGrid,
  countByDate,
  dateKey,
  daysInMonth,
  eventsOn,
  isValidTime,
  monthTitle,
  removeEvent,
  todayKey,
  validateEvent,
  weekdayLabels,
} from "./calendar";

describe("dates", () => {
  it("formats keys and normalises overflow", () => {
    expect(dateKey(2025, 0, 5)).toBe("2025-01-05");
    expect(dateKey(2025, 0, 32)).toBe("2025-02-01");
    expect(todayKey(new Date(2024, 1, 29))).toBe("2024-02-29");
  });
  it("knows month lengths incl. leap years", () => {
    expect(daysInMonth(2024, 1)).toBe(29);
    expect(daysInMonth(2025, 1)).toBe(28);
    expect(daysInMonth(2025, 11)).toBe(31);
  });
  it("adds months across years", () => {
    expect(addMonths(2025, 11, 1)).toEqual({ year: 2026, month: 0 });
    expect(addMonths(2025, 0, -1)).toEqual({ year: 2024, month: 11 });
    expect(addMonths(2025, 5, -18)).toEqual({ year: 2023, month: 11 });
  });
  it("titles months", () => {
    expect(monthTitle(2025, 8)).toBe("September 2025");
  });
});

describe("buildMonthGrid", () => {
  it("starts on the right weekday (Sunday start)", () => {
    // June 2025 starts on a Sunday.
    const grid = buildMonthGrid(2025, 5, 0);
    expect(grid).toHaveLength(42);
    expect(grid[0]).toEqual({ key: "2025-06-01", day: 1, inMonth: true });
    expect(grid.filter((c) => c.inMonth)).toHaveLength(30);
    expect(grid[41].key).toBe("2025-07-12");
  });
  it("pads with previous month days (Monday start)", () => {
    const grid = buildMonthGrid(2025, 5, 1);
    expect(grid[0]).toEqual({ key: "2025-05-26", day: 26, inMonth: false });
    expect(grid[6].key).toBe("2025-06-01");
    expect(weekdayLabels(1)[0]).toBe("Mon");
  });
});

describe("events", () => {
  const base = addEvent(addEvent([], { date: "2025-06-10", title: "Dentist", time: "14:00" }, "1"), { date: "2025-06-10", title: "Holiday" }, "2");

  it("validates input", () => {
    expect(validateEvent({ date: "2025-06-10", title: "  " })).toMatch(/Title/);
    expect(validateEvent({ date: "", title: "x" })).toMatch(/date/);
    expect(validateEvent({ date: "2025-06-10", title: "x", time: "25:00" })).toMatch(/HH:MM/);
    expect(validateEvent({ date: "2025-06-10", title: "x", time: "09:30" })).toBeNull();
    expect(isValidTime("7:30")).toBe(false);
    expect(() => addEvent([], { date: "2025-06-10", title: "" }, "x")).toThrow();
  });
  it("lists all-day first, then by time", () => {
    const withMorning = addEvent(base, { date: "2025-06-10", title: "Standup", time: "09:00" }, "3");
    expect(eventsOn(withMorning, "2025-06-10").map((e) => e.title)).toEqual(["Holiday", "Standup", "Dentist"]);
    expect(eventsOn(withMorning, "2025-06-11")).toEqual([]);
  });
  it("counts and removes", () => {
    expect(countByDate(base).get("2025-06-10")).toBe(2);
    expect(removeEvent(base, "1").map((e) => e.id)).toEqual(["2"]);
  });
});
