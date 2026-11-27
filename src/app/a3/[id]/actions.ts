"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { getA3, saveA3Version } from "@/lib/a3/repository";
import { applyPart, isEditablePart, PART_LABELS } from "@/lib/a3/edit";
import { parseCsv, type Table } from "@/lib/a3/import";
import { MAX_UPLOAD_BYTES, readXlsx, UnsafeWorkbookError } from "@/lib/a3/excel";
import { limiter, RULES, tooManyMessage } from "@/lib/security/rate-limit";

export type SaveState = { ok: true; version: number } | { ok: false; error: string };

const saveInput = z.object({
  a3Id: z.uuid(),
  baseVersion: z.number().int().positive(),
  part: z.string().refine(isEditablePart),
  data: z.unknown(),
});

const CONFLICT =
  "This A3 was saved somewhere else since you opened it. Copy anything you need, then reload the page to see the latest version.";

/** Saves one part of the A3 (the header, a section or the metrics) as a new version. */
export async function savePart(input: z.input<typeof saveInput>): Promise<SaveState> {
  const user = await requireUser();
  const limited = limiter.hit(`save:${user.id}`, RULES.save);
  if (!limited.ok) return { ok: false, error: tooManyMessage(limited.retryAfterSeconds) };
  const parsed = saveInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That save could not be read. Reload the page and try again." };
  const { a3Id, baseVersion, part, data } = parsed.data;
  if (!isEditablePart(part)) return { ok: false, error: "Unknown section." };

  const a3 = await getA3(user.id, a3Id);
  if (!a3) return { ok: false, error: "This A3 could not be found." };
  if (a3.version !== baseVersion) return { ok: false, error: CONFLICT };

  let document;
  try {
    document = applyPart(a3.document, part, data);
  } catch (e) {
    const issue = e instanceof z.ZodError ? e.issues[0] : undefined;
    const where = issue?.path.length ? ` (${issue.path.join(" › ")})` : "";
    return { ok: false, error: `${PART_LABELS[part]} has a value that can't be saved${where}: ${(issue?.message ?? "invalid").replace(/\.$/, "")}.` };
  }

  const result = await saveA3Version({ ownerId: user.id, a3Id, baseVersion, document });
  if (!result.ok) {
    if (result.reason === "no_change") return { ok: true, version: baseVersion };
    if (result.reason === "conflict") return { ok: false, error: CONFLICT };
    return { ok: false, error: "This A3 could not be found." };
  }
  refresh();
  return { ok: true, version: result.version };
}

const restoreInput = z.object({ a3Id: z.uuid(), version: z.coerce.number().int().positive() });

/** Makes an earlier version current again by saving a copy of it as the newest version. */
export async function restoreVersion(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (!limiter.hit(`save:${user.id}`, RULES.save).ok) redirect("/a3");
  const parsed = restoreInput.safeParse({ a3Id: formData.get("a3Id"), version: formData.get("version") });
  if (!parsed.success) redirect("/a3");
  const { a3Id, version } = parsed.data;
  const old = await getA3(user.id, a3Id, version);
  if (!old) redirect("/a3");
  if (version !== old.currentVersion) {
    await saveA3Version({
      ownerId: user.id,
      a3Id,
      baseVersion: old.currentVersion,
      document: old.document,
      summary: `Restored version ${version}`,
    });
  }
  redirect(`/a3/${a3Id}`);
}

export type ReadTableState = { ok: true; table: Table; fileName: string } | { ok: false; error: string };

/**
 * Reads an uploaded CSV or Excel file into rows for the import preview. The
 * file itself is not stored: only the numbers the person maps and saves are.
 */
export async function readTableFile(formData: FormData): Promise<ReadTableState> {
  const user = await requireUser();
  const limited = limiter.hit(`upload:${user.id}`, RULES.upload);
  if (!limited.ok) return { ok: false, error: tooManyMessage(limited.retryAfterSeconds) };
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a CSV or Excel file." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "That file is larger than 2 MB. Upload just the columns you need." };
  const name = file.name.toLowerCase();
  try {
    let table: Table;
    if (name.endsWith(".csv") || name.endsWith(".txt") || name.endsWith(".tsv")) {
      table = parseCsv(await file.text());
    } else if (name.endsWith(".xlsx")) {
      table = await readXlsx(await file.arrayBuffer());
    } else {
      return { ok: false, error: "Use a .csv or .xlsx file. Older .xls files need saving as .xlsx first." };
    }
    if (table.rows.length === 0) return { ok: false, error: "No rows found under the header row." };
    return { ok: true, table, fileName: file.name };
  } catch (e) {
    if (e instanceof UnsafeWorkbookError) {
      return { ok: false, error: "That workbook is too large once unpacked. Copy just the columns you need into a new file." };
    }
    return { ok: false, error: "That file could not be read. Check it opens in Excel and try again." };
  }
}
