import "server-only";
import { db } from "@/lib/db";
import { a3DocumentSchema, emptyA3, type A3Document } from "./schema";

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
  version: number;
  updatedAt: Date;
  document: A3Document;
};

export async function getA3(ownerId: string, id: string): Promise<LoadedA3 | null> {
  const a3 = await db.a3.findFirst({ where: { id, ownerId } });
  if (!a3) return null;
  const version = await db.a3Version.findUnique({
    where: { a3Id_version: { a3Id: a3.id, version: a3.currentVersion } },
  });
  if (!version) return null;
  return {
    id: a3.id,
    title: a3.title,
    status: a3.status,
    pdcaStage: a3.pdcaStage,
    version: a3.currentVersion,
    updatedAt: a3.updatedAt,
    document: a3DocumentSchema.parse(version.document),
  };
}
