# A3 dashboard

This repository holds the A3 coach app: a web app where a person describes a problem in plain language and a guided AI coach turns it into a problem-solving A3 on a live dashboard. The system design is in [docs/architecture.md](docs/architecture.md). The app itself is being built in phases; this foundation already validates data changes. No real A3 records have been supplied.

## Run the app locally

Use Node.js 22.18 or later and PostgreSQL. The quickest database is Docker:

```sh
cp .env.example .env
docker compose up -d db
npm ci
npm run db:deploy
npm run invite -- you@example.com   # prints a one-time sign-in link
npm run dev
```

Open the printed link, enter your name, and you land on My A3s at http://localhost:3000/a3. Each invite link works once and expires after 14 days.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run lint` · `npm run typecheck` · `npm test` | The same checks CI runs |
| `npm run build` | Production build (standalone server for the Docker image) |
| `npm run db:migrate` | Create a migration after changing `prisma/schema.prisma` |
| `npm run invite -- email` | Create an invite link for a tester |

Use test data only until the Azure environment is approved.

## Run the foundation checks

Use Git and Python 3.12. From a fresh checkout in Bash (including Git Bash on Windows with the appropriate Python executable):

```sh
git clone https://github.com/Stephjm24/a3-dashboard.git
cd a3-dashboard
python3.12 -m venv .venv
.venv/bin/python -m pip install --only-binary=:all: -r scripts/requirements.txt
.venv/bin/python scripts/check.py
.venv/bin/python -m unittest discover -s tests -v
```

For Windows PowerShell, run the same clone and change-directory commands, then:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --only-binary=:all: -r scripts/requirements.txt
.\.venv\Scripts\python.exe scripts/check.py
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

A successful run prints `Foundation checks passed.` and a passing test summary. Python is a development tool for this foundation. The app's own commands are in the section above.

## Where to start

- [System architecture](docs/architecture.md) has the diagrams: system context, a coach turn, the coaching flow, environments and stored data.
- [0002 · System architecture](docs/decisions/0002-system-architecture.md) records the agreed design decisions.
- [0001 · Repository boundaries](docs/decisions/0001-repository-boundaries.md) records the repository layout and placement conventions.
- [Data handbook](docs/data.md) defines contracts, ownership, fixture isolation and the first real dataset review.
- [Development and release workflow](CONTRIBUTING.md) covers branches, review, settings and recovery.
- [Delivery plan](docs/delivery.md) sets out the build phases, hosting and completion criteria.
- [Changelog](CHANGELOG.md) records changes intended for release.

Phase 1 (app foundation) is in place. Next is phase 2: editing every A3 section by hand, with version history and charts.
