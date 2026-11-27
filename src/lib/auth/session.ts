import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { daysFromNow, generateToken, hashToken, SESSION_LIFETIME_DAYS } from "./tokens";

const SECURE = process.env.NODE_ENV === "production";
// In production the __Host- prefix makes the browser refuse the cookie unless it
// is Secure, has no Domain and covers the whole site, so another site on a
// shared parent domain cannot set or overwrite it.
const COOKIE = SECURE ? "__Host-a3_session" : "a3_session";
const MAX_TOKEN_LENGTH = 100;

export type CurrentUser = { id: string; email: string; name: string };

/** Starts a session for the user and sets the cookie. Call only from a Server Action. */
export async function startSession(userId: string): Promise<void> {
  const token = generateToken();
  const expiresAt = daysFromNow(SESSION_LIFETIME_DAYS);
  // Tidies up this person's expired sessions while signing them in.
  await db.session.deleteMany({ where: { userId, expiresAt: { lte: new Date() } } });
  await db.session.create({ data: { tokenHash: hashToken(token), userId, expiresAt } });
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: SECURE,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token || token.length > MAX_TOKEN_LENGTH) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await db.session.deleteMany({ where: { id: session.id } });
    return null;
  }
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
  if (token && token.length <= MAX_TOKEN_LENGTH) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  store.delete(COOKIE);
}
