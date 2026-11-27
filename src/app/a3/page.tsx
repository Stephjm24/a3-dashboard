import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth/session";
import { listA3s } from "@/lib/a3/repository";
import { STATUS_LABEL } from "@/lib/a3/edit";
import { NewA3Form } from "@/components/forms";
import { SignOutButton } from "@/components/sign-out";

export default function MyA3sPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <Suspense fallback={<p className="text-sm text-slate-500">Loading your A3s…</p>}>
        <MyA3s />
      </Suspense>
    </div>
  );
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

async function MyA3s() {
  const user = await requireUser();
  const a3s = await listA3s(user.id);
  return (
    <>
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My A3s</h1>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>{user.name}</span>
          <SignOutButton />
        </div>
      </div>
      <div className="mb-8">
        <NewA3Form />
      </div>
      {a3s.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No A3s yet. Name a problem above to start your first one.
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {a3s.map((a3) => (
            <li key={a3.id}>
              <Link href={`/a3/${a3.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50">
                <span className="font-medium">{a3.title}</span>
                <span className="flex shrink-0 items-center gap-4 text-xs text-slate-500">
                  <span>{STATUS_LABEL[a3.status as keyof typeof STATUS_LABEL] ?? a3.status}</span>
                  <span className="uppercase">{a3.pdcaStage}</span>
                  <span>v{a3.currentVersion}</span>
                  <span>{dateFormat.format(a3.updatedAt)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
