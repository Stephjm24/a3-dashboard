import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { listVersions } from "@/lib/a3/repository";

export default function HistoryPage({ params }: PageProps<"/a3/[id]/history">) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <Suspense fallback={<p className="text-sm text-slate-500">Loading history…</p>}>
        <History params={params} />
      </Suspense>
    </div>
  );
}

const timeFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

const SOURCE_LABEL: Record<string, string> = { person: "You", system: "System", ai_draft: "Coach draft" };

async function History({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const a3 = await listVersions(user.id, id);
  if (!a3) notFound();
  return (
    <>
      <Link href={`/a3/${a3.id}`} className="text-sm text-slate-600 hover:underline">
        ← Back to the A3
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Version history</h1>
      <p className="mb-6 text-sm text-slate-600">
        {a3.title}. Every save is kept. Open a version to see the A3 and its charts as they were, or restore it.
      </p>
      <ol className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {a3.versions.map((v) => (
          <li key={v.version}>
            <Link
              href={v.version === a3.currentVersion ? `/a3/${a3.id}` : `/a3/${a3.id}/history/${v.version}`}
              className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-slate-50"
            >
              <span>
                <span className="font-medium">v{v.version}</span>
                <span className="ml-3 text-sm">{v.changeSummary}</span>
                {v.version === a3.currentVersion && (
                  <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-900">Current</span>
                )}
              </span>
              <span className="shrink-0 text-xs text-slate-500">
                {SOURCE_LABEL[v.source] ?? v.source} · {timeFormat.format(v.createdAt)}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}
