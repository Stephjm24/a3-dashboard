import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { getA3 } from "@/lib/a3/repository";
import { A3Sheet } from "@/components/a3/a3-sheet";
import { restoreVersion } from "../../actions";

export default function VersionPage({ params }: PageProps<"/a3/[id]/history/[version]">) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading version…</p>}>
      <Version params={params} />
    </Suspense>
  );
}

async function Version({ params }: { params: Promise<{ id: string; version: string }> }) {
  const user = await requireUser();
  const { id, version } = await params;
  const n = z.coerce.number().int().positive().safeParse(version);
  if (!z.uuid().safeParse(id).success || !n.success) notFound();
  const a3 = await getA3(user.id, id, n.data);
  if (!a3) notFound();
  if (a3.version === a3.currentVersion) redirect(`/a3/${id}`);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-300 bg-amber-50 px-6 py-2 text-sm">
        <span>
          <Link href={`/a3/${id}/history`} className="text-slate-700 hover:underline">
            ← Version history
          </Link>
          <span className="ml-4 text-amber-950">
            You are looking at version {a3.version}. The current version is {a3.currentVersion}.
          </span>
        </span>
        <form action={restoreVersion}>
          <input type="hidden" name="a3Id" value={id} />
          <input type="hidden" name="version" value={a3.version} />
          <button type="submit" className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white">
            Restore as v{a3.currentVersion + 1}
          </button>
        </form>
      </div>
      <A3Sheet a3={a3} editable={false} />
    </div>
  );
}
