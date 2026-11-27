# A3 dashboard

This repository holds the source and contracts for the A3 web application dashboard. The current foundation can validate data changes before the first application import. The example contains two fictional labels. No dashboard records have been supplied.

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

A successful run prints `Foundation checks passed.` and a passing test summary. Python is a development tool for this foundation. The application runtime and build command will be documented here when its existing source is imported.

## Where to start

- [Architecture and integration decisions](docs/decisions/0001-repository-boundaries.md) records the evidence, annotated tree and where to place the existing app.
- [Data handbook](docs/data.md) defines contracts, ownership, fixture isolation and the first real dataset review.
- [Development and release workflow](CONTRIBUTING.md) covers branches, review, settings and recovery.
- [Delivery plan](docs/delivery.md) sets out the six phases, hosting options and completion criteria.
- [Changelog](CHANGELOG.md) records changes intended for release.

The next application contribution should be a baseline import of the working Claude export. Include its entry point, assets, manifests, lockfile if present, and the instructions originally used to run it.
