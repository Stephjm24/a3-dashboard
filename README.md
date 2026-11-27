# A3 dashboard

An invite-only workspace for developing a seven-section problem-solving A3. In the current version, a tester can sign in, create an A3, reopen it from **My A3s** and see its initial version and section layout. The coach pane shows the opening prompt. Manual section editing and charts are planned for phase 2, followed by interactive coaching in phase 3. Use synthetic test data for local development and tester sessions.

## Run locally

Use Node.js 22.18 or later, npm and PostgreSQL. With Docker Compose installed, run the following from the repository root. In PowerShell, use `Copy-Item .env.example .env` for the first command. Create the local environment file on first setup only.

```sh
cp -n .env.example .env
docker compose up -d --wait db
npm ci
npm run db:deploy
npm run invite -- tester@example.com
npm run dev
```

Open the invite URL printed by the command and enter your name. It is single-use and expires after 14 days. After signing in, open **My A3s**, enter a problem title and open the new A3. On subsequent starts, bring up the database and run `npm run dev`.

## Find your way around

| To work on | Start here |
| --- | --- |
| Pages, navigation and server actions | [src/app](src/app) |
| The A3 sheet, coach pane and progress strip | [src/components/a3](src/components/a3). Shared forms and sign-out live in [src/components](src/components). |
| A3 sections, validation, progress and database access | [src/lib/a3](src/lib/a3). TypeScript unit tests sit beside the code they cover. |
| Sign-in, sessions and invites | [src/lib/auth](src/lib/auth) and the [invite creation script](scripts/create-invite.ts) |
| Database tables and migration history | [prisma/schema.prisma](prisma/schema.prisma) and [prisma/migrations](prisma/migrations) |
| Versioned reference data and synthetic samples | [Data guide](docs/data.md), [contracts](data/schemas) and [fixtures](tests/fixtures) |
| Running checks and submitting a change | [Contributor guide](CONTRIBUTING.md) and [CI workflows](.github/workflows) |

## Project guides

- [System architecture](docs/architecture.md) shows how the proposed coach, A3 workspace and storage fit together. [Decision records](docs/decisions) preserve the reasoning behind those choices.
- [Delivery plan](docs/delivery.md) lists the six phases, what the product owner reviews and where deployments are planned.
- [Changelog](CHANGELOG.md) records additions awaiting release.
