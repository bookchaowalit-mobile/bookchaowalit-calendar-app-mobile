import { describe, expect, it } from "vitest";
import { addEvent, isCalendarEvent } from "./calendar";
import { encodeEnvelope, listCodec } from "./persist";

describe("event persistence", () => {
  const codec = listCodec(isCalendarEvent);

  it("round-trips events created by addEvent", () => {
    const events = addEvent(addEvent([], { date: "2026-03-01", title: "Dentist", time: "09:30" }, "a"), { date: "2026-03-02", title: "Gym" }, "b");
    expect(codec.decode(codec.encode(events))).toEqual(events);
  });

  it("drops malformed entries instead of failing the load", () => {
    const raw = encodeEnvelope([
      { id: "ok", date: "2026-03-01", title: "Ok" },
      { id: "bad-date", date: "March 1", title: "x" },
      { id: "bad-time", date: "2026-03-01", title: "x", time: "25:00" },
      { id: "no-title", date: "2026-03-01", title: "  " },
      "junk",
    ]);
    expect(codec.decode(raw)?.map((e) => e.id)).toEqual(["ok"]);
  });
});
