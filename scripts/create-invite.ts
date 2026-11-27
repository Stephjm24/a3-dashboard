// Creates a one-time invite link for a tester.
// Usage: npm run invite -- person@example.com
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { daysFromNow, generateToken, hashToken, INVITE_LIFETIME_DAYS } from "../src/lib/auth/tokens";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error("Usage: npm run invite -- person@example.com");
    process.exit(1);
  }
  const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const token = generateToken();
    await db.invite.create({
      data: { email, tokenHash: hashToken(token), expiresAt: daysFromNow(INVITE_LIFETIME_DAYS) },
    });
    console.log(`Invite for ${email}, valid for ${INVITE_LIFETIME_DAYS} days and usable once:`);
    console.log(`${appUrl}/invite/${token}`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
