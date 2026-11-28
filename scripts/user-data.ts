// Handles data protection requests from the command line. There is no admin
// page: like invites, this needs the database address.
//
//   npm run user-data -- export person@example.com > person.json
//   npm run user-data -- delete person@example.com --confirm
//   npm run user-data -- purge
//
// See docs/compliance/DATA_RETENTION.md for when to use each one.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { deleteUserData, exportUserData, purgeExpired } from "../src/lib/privacy/user-data";

const USAGE = `Usage:
  npm run user-data -- export <email>            Print a JSON copy of everything stored about the person
  npm run user-data -- delete <email> --confirm  Delete the person's account, invites, sessions and A3s
  npm run user-data -- purge                     Delete expired sessions and unused expired invites`;

async function main() {
  const [command, email, flag] = process.argv.slice(2);
  if (!command || ((command === "export" || command === "delete") && !email)) {
    console.error(USAGE);
    process.exit(1);
  }
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    if (command === "export") {
      const data = await exportUserData(db, email);
      if (!data) {
        console.error(`Nothing is stored for ${email}.`);
        process.exit(2);
      }
      console.log(JSON.stringify(data, null, 2));
    } else if (command === "delete") {
      if (flag !== "--confirm") {
        console.error(`This permanently deletes everything stored for ${email}. Run it again with --confirm.`);
        process.exit(1);
      }
      const result = await deleteUserData(db, email);
      if (!result.found) {
        console.error(`Nothing is stored for ${email}.`);
        process.exit(2);
      }
      console.log(
        `Deleted ${email}: ${result.a3s} A3(s) with all their versions, ${result.sessions} session(s) and ${result.invites} invite(s).`,
      );
      console.log("Copies in database backups remain until those backups expire. Record the request in the rights log.");
    } else if (command === "purge") {
      const result = await purgeExpired(db);
      console.log(`Deleted ${result.sessions} expired session(s) and ${result.invites} unused expired invite(s).`);
    } else {
      console.error(USAGE);
      process.exit(1);
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
