# Contributing

The product owner reviews and merges pull requests into `main`. Make one change on a short-lived branch such as `feat/<topic>`, `fix/<topic>`, `data/<dataset>` or `chore/<topic>`.

## Where changes belong

Use the [repository map](README.md#find-your-way-around) to place new files. Keep the A3 document schema and its tests together in `src/lib/a3/`. Put a database change and its Prisma migration in the same PR. Use the [data guide](docs/data.md) for reference contracts and synthetic fixtures.

Update the existing guide for the subject. Put changes to an agreed design in a numbered record under `docs/decisions/` and link the earlier decision if it has been superseded. Update relative links when moving files. Record user-visible or data-contract changes in [CHANGELOG.md](CHANGELOG.md).

## Check a change

| GitHub job | Local equivalent |
| --- | --- |
| [App checks](.github/workflows/app.yml) | After [local setup](README.md#run-locally), run `npm run lint`, `npm run typecheck`, `npm test`, `npm run db:deploy` against the local test database and `npm run build`. |
| [Foundation checks](.github/workflows/foundation.yml) | Run the repository validator and Python tests below. They cover tracked files, static JSON contracts and their fixtures. |

The Python checks use Git and Python 3.12. Run from the repository root. On macOS or Linux:

```sh
python3.12 -m venv .venv
.venv/bin/python -m pip install --only-binary=:all: -r scripts/requirements.txt
.venv/bin/python scripts/check.py
.venv/bin/python -m unittest discover -s tests -v
```

On Windows PowerShell:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --only-binary=:all: -r scripts/requirements.txt
.\.venv\Scripts\python.exe scripts/check.py
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

Create the environment and install its dependencies on first setup. Rerun the last two commands as you work. The validator inspects working-tree copies of tracked and unignored new files. CI checks the committed revision.

## Open a pull request

Use a short imperative commit subject such as `docs: clarify local setup` or `feat: add section editing`. Review `git status --short`, stage the intended files, then inspect `git diff --cached` and run `git diff --cached --check`. Push the branch and open a pull request. Explain what changed and how you checked it. For schema changes, record the data owner's decision.

## Configure GitHub

The intended protection for `main` requires a PR and both jobs above, and blocks deletion and force pushes. A solo maintainer can review the diff and merge after CI passes. When a second maintainer is available, require independent approval. Check the live repository settings to verify enforcement.

Use read-only workflow permissions by default. The validation workflow takes no secrets and disables persisted checkout credentials. Run untrusted changes using `pull_request`. Keep deployment credentials scoped to the protected environment, and prefer short-lived identity when the chosen host supports it. Enable secret scanning or push protection where available for this public repository.

## Dependencies, secrets and assets

Review dependency and workflow updates in separate PRs. Keep the application lockfile and use the package manager's locked install command. For foundation tooling, pin direct and transitive packages together, test the update and review upstream release notes. Pin actions to an immutable commit. Keep dependency auto-merge disabled.

Review staged contents, including screenshots and generated JSON. Ignore rules and CI catch common mistakes. The built-in scanner recognises common private-key headers, GitHub token patterns, private paths and files above 5 MiB. It cannot determine data sensitivity or detect every credential. Store large generated media in object storage. If a legitimate versioned binary is needed, document its owner, review the size policy and consider Git LFS. Keep provider secrets on the server. Browser-shipped configuration is readable by its audience.

If a credential enters Git, revoke or rotate it immediately, then investigate exposure and coordinate any history cleanup with the maintainer. A revert leaves previous commits accessible.

## Release and recover

Record user-visible changes and contract changes under Unreleased in the changelog. At the first deployable release, move entries to a dated version and add an annotated tag, for example `v0.1.0`, to the tested commit. Use patch for compatible fixes, minor for compatible features, and major for an incompatible public contract after 1.0. Flag breaking changes explicitly during 0.x. Keep schema versions independent of application tags.

Record the commit, artifact/deployment ID, schema versions and last known-good deployment. For a faulty release, promote the previous immutable artifact, smoke-test it, and open a revert PR from current main. For a squash commit use `git revert <squash-commit>` on a new fix branch. If database migrations exist, check compatibility first and use the migration recovery plan. A source revert does not undo writes. Never force-push shared history as a rollback.
