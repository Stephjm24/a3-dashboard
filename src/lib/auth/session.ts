import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { daysFromNow, generateToken, hashToken, SESSION_LIFETIME_DAYS } from "./tokens";

const COOKIE = "a3_session";

export type CurrentUser = { id: string; email: string; name: string };

/** Starts a session for the user and sets the cookie. Call only from a Server Action. */
export async function startSession(userId: string): Promise<void> {
  const token = generateToken();
  const expiresAt = daysFromNow(SESSION_LIFETIME_DAYS);
  await db.session.create({ data: { tokenHash: hashToken(token), userId, expiresAt } });
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt <= new Date()) return null;
  return { id: session.user.id, email: session.user.email, name: session.user.name };
}

/** Returns the signed-in user, or sends the browser to the sign-in page. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}

/** Ends the current session. Call only from a Server Action. */
export async function endSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  store.delete(COOKIE);
}
