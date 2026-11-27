// Turns an uploaded table (CSV, or an Excel sheet read on the server) into a
// metric series. Pure functions: no file system, no database.

export type Table = { columns: string[]; rows: string[][] };

export const MAX_IMPORT_ROWS = 5000;

/** Parses CSV text (comma, semicolon or tab separated; quoted fields allowed). */
export function parseCsv(text: string): Table {
  const clean = text.replace(/^﻿/, "");
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = [",", ";", "\t"]
    .map((d) => ({ d, n: firstLine.split(d).length }))
    .sort((a, b) => b.n - a.n)[0].d;

  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (quoted) {
      if (ch === '"' && clean[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"' && field === "") quoted = true;
    else if (ch === delimiter) {
      record.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && clean[i + 1] === "\n") i++;
      record.push(field);
      records.push(record);
      record = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || record.length > 0) {
    record.push(field);
    records.push(record);
  }
  return toTable(records);
}

/** Uses the first non-empty row as column names and drops empty rows. */
export function toTable(records: string[][]): Table {
  const nonEmpty = records.filter((r) => r.some((c) => c.trim() !== ""));
  const [header = [], ...rows] = nonEmpty;
  const width = Math.max(header.length, ...rows.map((r) => r.length));
  const columns = Array.from({ length: width }, (_, i) => header[i]?.trim() || `Column ${i + 1}`);
  return { columns, rows: rows.slice(0, MAX_IMPORT_ROWS).map((r) => r.map((c) => c.trim())) };
}

export type DateOrder = "day_first" | "month_first";

/** Reads a date cell as YYYY-MM-DD. Accepts ISO dates and dd/mm/yyyy or mm/dd/yyyy. */
export function parseDateCell(value: string, order: DateOrder): string | null {
  const v = value.trim();
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(v);
  if (iso) return validDate(+iso[1], +iso[2], +iso[3]);
  const parts = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/.exec(v);
  if (parts) {
    const [a, b] = [+parts[1], +parts[2]];
    const year = parts[3].length === 2 ? 2000 + +parts[3] : +parts[3];
    return order === "day_first" ? validDate(year, b, a) : validDate(year, a, b);
  }
  return null;
}

function validDate(y: number, m: number, d: number): string | null {
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return date.toISOString().slice(0, 10);
}

/** Reads a number cell, allowing thousands separators, a % sign and a decimal comma. */
export function parseNumberCell(value: string): number | null {
  let v = value.trim().replace(/[%\s]/g, "");
  if (v === "") return null;
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(v)) v = v.replace(/\./g, "").replace(",", ".");
  else if (/^-?\d+,\d+$/.test(v)) v = v.replace(",", ".");
  else v = v.replace(/,/g, "");
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export type SeriesImport = {
  series: { date: string; value: number }[];
  /** Rows that could not be read, by 1-based row number after the header. */
  skipped: number[];
};

/** Builds a date-sorted series from two columns. Later rows win for a repeated date. */
export function tableToSeries(table: Table, dateColumn: number, valueColumn: number, order: DateOrder): SeriesImport {
  const byDate = new Map<string, number>();
  const skipped: number[] = [];
  table.rows.forEach((row, i) => {
    const date = parseDateCell(row[dateColumn] ?? "", order);
    const value = parseNumberCell(row[valueColumn] ?? "");
    if (date === null || value === null) skipped.push(i + 1);
    else byDate.set(date, value);
  });
  const series = [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }));
  return { series, skipped };
}
