import "server-only";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { toTable, type Table } from "./import";

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
/** A 2 MB .xlsx can unpack to gigabytes (a "zip bomb"). Real metric sheets stay far below these. */
export const MAX_UNPACKED_BYTES = 50 * 1024 * 1024;
export const MAX_ZIP_ENTRIES = 1000;

export class UnsafeWorkbookError extends Error {}

/**
 * Reads only the zip directory, which states each part's unpacked size, and
 * refuses files that would unpack too large before anything is decompressed.
 */
export async function checkXlsxSize(bytes: ArrayBuffer): Promise<void> {
  const zip = await JSZip.loadAsync(bytes);
  const entries = Object.values(zip.files);
  if (entries.length > MAX_ZIP_ENTRIES) throw new UnsafeWorkbookError("too many parts");
  let total = 0;
  for (const entry of entries) {
    // JSZip keeps the size from the zip directory here; it is not part of its typed API.
    const size = (entry as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize;
    if (typeof size !== "number" || size < 0) {
      if (entry.dir) continue;
      throw new UnsafeWorkbookError("unknown part size");
    }
    total += size;
    if (total > MAX_UNPACKED_BYTES) throw new UnsafeWorkbookError("unpacks too large");
  }
}

/** Reads the first worksheet of an .xlsx file as text cells. Dates become YYYY-MM-DD. */
export async function readXlsx(bytes: ArrayBuffer): Promise<Table & { sheet: string }> {
  await checkXlsxSize(bytes);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(bytes);
  const sheet = workbook.worksheets[0];
  if (!sheet) return { sheet: "", columns: [], rows: [] };
  const records: string[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const cells: string[] = [];
    for (let c = 1; c <= row.cellCount; c++) cells.push(cellText(row.getCell(c).value));
    records.push(cells);
  });
  return { sheet: sheet.name, ...toTable(records) };
}

function cellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "string") return value;
  if ("result" in value) return cellText(value.result as ExcelJS.CellValue);
  if ("richText" in value) return value.richText.map((r) => r.text).join("");
  if ("text" in value) return String(value.text);
  return "";
}
