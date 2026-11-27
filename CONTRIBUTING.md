# Contributing

## Make a change

Use reviewed `main` and short-lived branches. Choose `feat/<topic>`, `fix/<topic>`, `data/<dataset>` or `chore/<topic>`. In the checked-out repository, with the validation environment installed:

```sh
git switch main
git pull --ff-only
git switch -c chore/document-import-baseline
# Make the intended change, then review its working-tree and staged forms.
.venv/bin/python scripts/check.py
.venv/bin/python -m unittest discover -s tests -v
git status --short
git add --patch
# Stage new files by their exact paths. Confirm the staged diff includes them.
git diff --cached --check
git diff --cached
git commit -m "docs: record the dashboard import baseline"
git push -u origin HEAD
gh pr create --base main --fill
```

Use a short imperative commit subject prefixed by `feat:`, `fix:`, `data:`, `docs:` or `chore:`. Explain the reason, checks run, data source and any deployment impact in the PR. On Windows use the Python path in the README. The script inspects working-tree bytes of tracked and unignored new files. The clean CI checkout checks the committed bytes.

Review the final diff and green checks, then squash merge. A solo maintainer can review their own diff without requiring a second approver. Add an independent approval when a second maintainer is available. For schema changes, record the data owner's decision in the PR.

## Configure GitHub

After the first successful run, configure protection for `main` where the account plan supports it. Require a pull request and the exact job `Foundation checks`. Block deletion and force pushes. Leave the required approval count at zero for a solo maintainer and enforce these rules for maintainers when available. If enforcement is unavailable, use the same PR workflow manually and report that difference. Add the app's build and test jobs only after they exist and have run.

Use read-only workflow permissions by default. The validation workflow takes no secrets and disables persisted checkout credentials. Run untrusted changes using `pull_request`. Keep deployment credentials scoped to the protected environment, and prefer short-lived identity when the chosen host supports it. Enable secret scanning or push protection when available for this private repository.

## Dependencies, secrets and assets

Review dependency and workflow updates in separate PRs. Keep the application lockfile and use the package manager's locked install command. For foundation tooling, pin direct and transitive packages together, test the update and review upstream release notes. Pin actions to an immutable commit. Keep dependency auto-merge disabled.

Review staged contents, including screenshots and generated JSON. Ignore rules and CI catch common mistakes. The built-in scanner recognises common private-key headers, GitHub token patterns, private paths and files above 5 MiB. It cannot determine data sensitivity or detect every credential. Store large generated media in object storage. If a legitimate versioned binary is needed, document its owner, review the size policy and consider Git LFS. Keep provider secrets on the server. Browser-shipped configuration is readable by its audience.

If a credential enters Git, revoke or rotate it immediately, then investigate exposure and coordinate any history cleanup with the maintainer. A revert leaves previous commits accessible.

## Release and recover

Record user-visible changes and contract changes under Unreleased in the changelog. At the first deployable release, move entries to a dated version and add an annotated tag, for example `v0.1.0`, to the tested commit. Use patch for compatible fixes, minor for compatible features, and major for an incompatible public contract after 1.0. Flag breaking changes explicitly during 0.x. Keep schema versions independent of application tags.

Record the commit, artifact/deployment ID, schema versions and last known-good deployment. For a faulty release, promote the previous immutable artifact, smoke-test it, and open a revert PR from current main. For a squash commit use `git revert <squash-commit>` on a new fix branch. If database migrations exist, check compatibility first and use the migration recovery plan. A source revert does not undo writes. Never force-push shared history as a rollback.
