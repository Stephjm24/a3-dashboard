import "server-only";
import ExcelJS from "exceljs";
import { toTable, type Table } from "./import";

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

/** Reads the first worksheet of an .xlsx file as text cells. Dates become YYYY-MM-DD. */
export async function readXlsx(bytes: ArrayBuffer): Promise<Table & { sheet: string }> {
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
