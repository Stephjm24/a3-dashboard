import { Suspense } from "react";
import { db } from "@/lib/db";
import { hashToken, isUsableInvite } from "@/lib/auth/tokens";
import { AcceptInviteForm } from "@/components/forms";

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
