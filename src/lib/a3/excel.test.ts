import { describe, expect, it, vi } from "vitest";
import ExcelJS from "exceljs";
import JSZip from "jszip";

vi.mock("server-only", () => ({}));
const { checkXlsxSize, readXlsx, UnsafeWorkbookError, MAX_UNPACKED_BYTES } = await import("./excel");

async function workbookBytes(): Promise<ArrayBuffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Data");
  ws.addRow(["Week", "Minutes"]);
  ws.addRow([new Date("2026-10-05T00:00:00Z"), 85]);
  const buf = await wb.xlsx.writeBuffer();
  return new Uint8Array(buf as ArrayBuffer).slice().buffer;
}

describe("readXlsx", () => {
  it("still reads an ordinary workbook", async () => {
    const table = await readXlsx(await workbookBytes());
    expect(table.columns).toEqual(["Week", "Minutes"]);
    expect(table.rows).toEqual([["2026-10-05", "85"]]);
  });
});

describe("checkXlsxSize", () => {
  it("refuses a small file that unpacks too large, before unpacking it", async () => {
    const zip = new JSZip();
    // Zeros compress about 1000 to 1, so this is a few tens of KB on disk.
    zip.file("xl/worksheets/sheet1.xml", new Uint8Array(MAX_UNPACKED_BYTES + 1));
    const bytes = await zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE" });
    expect(bytes.byteLength).toBeLessThan(2 * 1024 * 1024);
    await expect(checkXlsxSize(bytes)).rejects.toBeInstanceOf(UnsafeWorkbookError);
    await expect(readXlsx(bytes)).rejects.toBeInstanceOf(UnsafeWorkbookError);
  });

  it("refuses a file with thousands of parts", async () => {
    const zip = new JSZip();
    for (let i = 0; i < 1001; i++) zip.file(`p${i}.xml`, "x");
    const bytes = await zip.generateAsync({ type: "arraybuffer" });
    await expect(checkXlsxSize(bytes)).rejects.toBeInstanceOf(UnsafeWorkbookError);
  });
});
