import "server-only";
import { db } from "@/lib/db";
import { a3DocumentSchema, emptyA3, type A3Document } from "./schema";
import { changedParts, describeChange, pdcaStageFor } from "./edit";

// Every query here filters by owner: a person only ever sees their own A3s.

export async function listA3s(ownerId: string) {
  return db.a3.findMany({
    where: { ownerId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, status: true, pdcaStage: true, currentVersion: true, updatedAt: true },
  });
}

export async function createA3(owner: { id: string; name: string }, title: string) {
  const document = emptyA3({ title, owner });
  return db.$transaction(async (tx) => {
    const a3 = await tx.a3.create({ data: { ownerId: owner.id, title } });
    await tx.a3Version.create({
      data: {
        a3Id: a3.id,
        version: 1,
        document,
        savedById: owner.id,
        changeSummary: "Created",
        source: "system",
      },
    });
    return a3;
  });
}

export type LoadedA3 = {
  id: string;
  title: string;
  status: string;
  pdcaStage: string;
  /** The version shown. */
  version: number;
  /** The latest version. Equal to `version` unless an earlier version is shown. */
  currentVersion: number;
  updatedAt: Date;
  document: A3Document;
};

/** Loads the current version, or an earlier one when `version` is given. */
export async function getA3(ownerId: string, id: string, version?: number): Promise<LoadedA3 | null> {
  const a3 = await db.a3.findFirst({ where: { id, ownerId } });
  if (!a3) return null;
  const wanted = version ?? a3.currentVersion;
  const row = await db.a3Version.findUnique({ where: { a3Id_version: { a3Id: a3.id, version: wanted } } });
  if (!row) return null;
  return {
    id: a3.id,
    title: a3.title,
    status: a3.status,
    pdcaStage: a3.pdcaStage,
    version: wanted,
    currentVersion: a3.currentVersion,
    updatedAt: wanted === a3.currentVersion ? a3.updatedAt : row.createdAt,
    document: a3DocumentSchema.parse(row.document),
  };
}

export type SaveResult =
  | { ok: true; version: number; summary: string }
  | { ok: false; reason: "not_found" | "conflict" | "no_change" };

/**
 * Saves `document` as the next version of the A3, if the A3 is still at
 * `baseVersion`. A save from a page that was opened before someone else's save
 * is refused rather than silently overwriting it.
 */
export async function saveA3Version(input: {
  ownerId: string;
  a3Id: string;
  baseVersion: number;
  document: A3Document;
  summary?: string;
  source?: "person" | "system";
}): Promise<SaveResult> {
  const document = a3DocumentSchema.parse(input.document);
  return db.$transaction(async (tx) => {
    const a3 = await tx.a3.findFirst({ where: { id: input.a3Id, ownerId: input.ownerId } });
    if (!a3) return { ok: false, reason: "not_found" } as const;
    if (a3.currentVersion !== input.baseVersion) return { ok: false, reason: "conflict" } as const;
    const base = await tx.a3Version.findUnique({
      where: { a3Id_version: { a3Id: a3.id, version: a3.currentVersion } },
    });
    const parts = base ? changedParts(a3DocumentSchema.parse(base.document), document) : [];
    if (base && parts.length === 0 && !input.summary) return { ok: false, reason: "no_change" } as const;

    const next = a3.currentVersion + 1;
    // Moves the pointer only if nobody saved in between, then writes the version.
    const moved = await tx.a3.updateMany({
      where: { id: a3.id, currentVersion: input.baseVersion },
      data: { currentVersion: next, title: document.title, status: document.status, pdcaStage: pdcaStageFor(document) },
    });
    if (moved.count !== 1) return { ok: false, reason: "conflict" } as const;
    const summary = input.summary ?? describeChange(parts);
    await tx.a3Version.create({
      data: {
        a3Id: a3.id,
        version: next,
        document,
        savedById: input.ownerId,
        changeSummary: summary,
        source: input.source ?? "person",
      },
    });
    return { ok: true, version: next, summary } as const;
  });
}

export async function listVersions(ownerId: string, a3Id: string) {
  const a3 = await db.a3.findFirst({ where: { id: a3Id, ownerId }, select: { id: true, title: true, currentVersion: true } });
  if (!a3) return null;
  const versions = await db.a3Version.findMany({
    where: { a3Id },
    orderBy: { version: "desc" },
    select: { version: true, changeSummary: true, source: true, createdAt: true },
  });
  return { ...a3, versions };
}
