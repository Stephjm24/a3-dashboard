# A3 dashboard

This repository holds the A3 coach app: a web app where a person describes a problem in plain language and a guided AI coach turns it into a problem-solving A3 on a live dashboard. The system design is in [docs/architecture.md](docs/architecture.md). The app itself is being built in phases; this foundation already validates data changes. No real A3 records have been supplied.

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

A successful run prints `Foundation checks passed.` and a passing test summary. Python is a development tool for this foundation. The application's run and build commands will be documented here when phase 1 lands.

## Where to start

- [System architecture](docs/architecture.md) has the diagrams: system context, a coach turn, the coaching flow, environments and stored data.
- [0002 · System architecture](docs/decisions/0002-system-architecture.md) records the agreed design decisions.
- [0001 · Repository boundaries](docs/decisions/0001-repository-boundaries.md) records the repository layout and placement conventions.
- [Data handbook](docs/data.md) defines contracts, ownership, fixture isolation and the first real dataset review.
- [Development and release workflow](CONTRIBUTING.md) covers branches, review, settings and recovery.
- [Delivery plan](docs/delivery.md) sets out the build phases, hosting and completion criteria.
- [Changelog](CHANGELOG.md) records changes intended for release.

The next application contribution is phase 1: the Next.js app, database, sign-in by invite link, the My A3s list and the empty A3 page.
