"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createA3 } from "@/lib/a3/repository";
import { endSession, requireUser, startSession } from "@/lib/auth/session";
import { hashToken, isUsableInvite } from "@/lib/auth/tokens";

export type FormState = { error?: string };

const acceptInviteInput = z.object({
  token: z.string().min(1),
  name: z.string().trim().min(1, "Please enter your name.").max(120),
});

export async function acceptInvite(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = acceptInviteInput.safeParse({ token: formData.get("token"), name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Something is missing." };

  const invite = await db.invite.findUnique({ where: { tokenHash: hashToken(parsed.data.token) } });
  if (!invite || !isUsableInvite(invite)) {
    return { error: "This invite link has expired or was already used. Ask for a new one." };
  }

  const user = await db.$transaction(async (tx) => {
    const person = await tx.user.upsert({
      where: { email: invite.email },
      update: { name: parsed.data.name },
      create: { email: invite.email, name: parsed.data.name },
    });
    // Marks the invite used only if nobody else used it first.
    const claimed = await tx.invite.updateMany({
      where: { id: invite.id, usedAt: null },
      data: { usedAt: new Date(), userId: person.id },
    });
    if (claimed.count !== 1) throw new Error("Invite already used");
    return person;
  });

  await startSession(user.id);
  redirect("/a3");
}

const newA3Input = z.object({
  title: z.string().trim().min(3, "Give the problem a short title.").max(160),
});

export async function newA3(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = newA3Input.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Something is missing." };
  const a3 = await createA3(user, parsed.data.title);
  redirect(`/a3/${a3.id}`);
}

export async function signOut(): Promise<void> {
  await endSession();
  redirect("/");
}
