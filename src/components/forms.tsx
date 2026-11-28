"use client";

import Link from "next/link";
import { useActionState } from "react";
import { acceptInvite, newA3, type FormState } from "@/app/actions";

const initial: FormState = {};

export function AcceptInviteForm({ token, email }: { token: string; email: string }) {
  const [state, action, pending] = useActionState(acceptInvite, initial);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <p className="text-sm text-slate-600">
        Signing in as <span className="font-medium text-slate-900">{email}</span>
      </p>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Your name
        <input
          name="name"
          required
          maxLength={120}
          autoComplete="name"
          className="rounded-md border border-slate-500 px-3 py-2 font-normal focus:border-blue-700 focus:outline-2 focus:outline-offset-1 focus:outline-blue-700"
        />
      </label>
      <p className="text-xs text-slate-600">
        Your email address is used to sign you in, and your name is shown as the owner of your A3s. Continuing sets one sign-in
        cookie. Read the{" "}
        <Link href="/privacy" className="font-medium text-blue-700 underline underline-offset-2">
          privacy notice
        </Link>
        .
      </p>
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Continue"}
      </button>
    </form>
  );
}

export function NewA3Form() {
  const [state, action, pending] = useActionState(newA3, initial);
  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="title" className="sr-only">
          Problem title
        </label>
        <input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={160}
          placeholder="Name the problem, not the solution: e.g. Late lab results delay discharges"
          className="rounded-md border border-slate-500 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-2 focus:outline-offset-1 focus:outline-blue-700"
        />
        {state.error && (
          <p role="alert" className="text-sm text-red-700">
            {state.error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Creating…" : "New A3"}
      </button>
    </form>
  );
}
