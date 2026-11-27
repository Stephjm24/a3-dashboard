import type { Metadata } from "next";
import { headers } from "next/headers";
import { connection } from "next/server";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { hashToken, isUsableInvite } from "@/lib/auth/tokens";
import { AcceptInviteForm } from "@/components/forms";
import { clientAddress, limiter, RULES, tooManyMessage } from "@/lib/security/rate-limit";

// Invite links carry a sign-in token: keep them out of search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function InvitePage({ params }: PageProps<"/invite/[token]">) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="mb-4 text-xl font-semibold">Welcome to A3 Coach</h1>
        <Suspense fallback={<p className="text-sm text-slate-500">Checking your invite…</p>}>
          <Invite params={params} />
        </Suspense>
      </div>
    </div>
  );
}

async function Invite({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  // Counts every visit at request time, never during prerendering.
  await connection();
  const limited = limiter.hit(`invite:${clientAddress(await headers())}`, RULES.invite);
  if (!limited.ok) return <p className="text-sm text-slate-700">{tooManyMessage(limited.retryAfterSeconds)}</p>;
  const invite = await db.invite.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!invite || !isUsableInvite(invite)) {
    return (
      <p className="text-sm text-slate-700">
        This invite link has expired or was already used. Ask for a new one.
      </p>
    );
  }
  return <AcceptInviteForm token={token} email={invite.email} />;
}
