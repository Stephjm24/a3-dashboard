import { describe, expect, it } from "vitest";
import { parseCsv, parseDateCell, parseNumberCell, tableToSeries } from "./import";

describe("parseCsv", () => {
  it("reads a header row, quoted fields and Windows line endings", () => {
    const table = parseCsv('﻿Week,"Turnaround, min"\r\n2026-10-05,85\r\n2026-10-12,"79"\r\n\r\n');
    expect(table.columns).toEqual(["Week", "Turnaround, min"]);
    expect(table.rows).toEqual([
      ["2026-10-05", "85"],
      ["2026-10-12", "79"],
    ]);
  });

  it("detects semicolon separated files", () => {
    expect(parseCsv("date;value\n01/10/2026;85,5").rows).toEqual([["01/10/2026", "85,5"]]);
  });
});

describe("cells", () => {
  it("reads ISO and day-first or month-first dates, and rejects impossible ones", () => {
    expect(parseDateCell("2026-10-05", "day_first")).toBe("2026-10-05");
    expect(parseDateCell("03/04/2026", "day_first")).toBe("2026-04-03");
    expect(parseDateCell("03/04/2026", "month_first")).toBe("2026-03-04");
    expect(parseDateCell("31/02/2026", "day_first")).toBeNull();
    expect(parseDateCell("last week", "day_first")).toBeNull();
  });

  it("reads numbers with separators, percentages and decimal commas", () => {
    expect(parseNumberCell("1,234.5")).toBe(1234.5);
    expect(parseNumberCell("1.234,5")).toBe(1234.5);
    expect(parseNumberCell("85,5")).toBe(85.5);
    expect(parseNumberCell("12%")).toBe(12);
    expect(parseNumberCell("n/a")).toBeNull();
    expect(parseNumberCell("")).toBeNull();
  });
});

describe("tableToSeries", () => {
  it("sorts by date, keeps the last value for a repeated date and reports unreadable rows", () => {
    const table = parseCsv("value,date\n79,12/10/2026\nx,13/10/2026\n85,05/10/2026\n80,12/10/2026");
    expect(tableToSeries(table, 1, 0, "day_first")).toEqual({
      series: [
        { date: "2026-10-05", value: 85 },
        { date: "2026-10-12", value: 80 },
      ],
      skipped: [2],
    });
  });
});
