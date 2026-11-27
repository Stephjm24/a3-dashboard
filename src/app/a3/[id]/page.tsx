import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { getA3 } from "@/lib/a3/repository";
import { A3Sheet } from "@/components/a3/a3-sheet";
import { CoachPane } from "@/components/a3/coach-pane";
import { ProgressStrip } from "@/components/a3/progress-strip";

export default function A3Page({ params }: PageProps<"/a3/[id]">) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading A3…</p>}>
      <Workspace params={params} />
    </Suspense>
  );
}

async function Workspace({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const a3 = await getA3(user.id, id);
  if (!a3) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-slate-200 bg-white px-6 py-2 text-sm">
        <Link href="/a3" className="text-slate-600 hover:underline">
          ← My A3s
        </Link>
      </div>
      <ProgressStrip doc={a3.document} />
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(320px,1fr)_2fr]">
        <CoachPane />
        <A3Sheet a3={a3} />
      </div>
    </div>
  );
}
