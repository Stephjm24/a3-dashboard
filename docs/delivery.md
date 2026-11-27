# Delivery plan

The app is built in six phases, agreed in [0002](decisions/0002-system-architecture.md). Each phase ends with something the product owner can click through and review, and lands as one or more reviewed pull requests.

| Phase | Deliverables | Complete when |
| --- | --- | --- |
| 1 · Foundation | Next.js app, PostgreSQL with Prisma, sign-in by email invite link, the My A3s list, and the empty A3 page laid out from the knowledge base. Docker setup and CI build. | A fresh checkout starts the app locally with one documented command, a tester can sign in, create an A3 and see the empty A3 page. |
| 2 · Manual A3 | Every section editable by hand, saved with version history. Charts drawn from typed data and CSV or Excel uploads. | All seven sections can be filled and saved without AI, and the charts redraw from the saved version. |
| 3 · Coach | Intake and synthesis, section-by-section coach turns, draft and accept, the AI connector, and the sample-problem checks. Needs an Anthropic API development key. | A sample problem can be taken from intake to a complete Plan section with the coach, and no number appears that the person did not supply. |
| 4 · Review and export | Rubric and read-in-reverse checks, flags beside sections, one-page PDF export. | The PDF matches the screen and the rubric flags known mistakes in the sample problems. |
| 5 · Testers | Deploy to Render with test data. Collect feedback, including on the screen layout. | Testers can sign in on Render and complete an A3; feedback is recorded as issues. |
| 6 · Azure | Azure Container Apps, Azure Database for PostgreSQL, Blob Storage, Key Vault, Entra ID sign-in, Claude on Microsoft Foundry. Needs Azure and Foundry approval. | The same build runs on Azure, the AI connector uses Foundry, and real A3 data is allowed. |

## Planned hosting by environment

| Environment | Host | Data | AI |
| --- | --- | --- | --- |
| Local | Laptop or GitHub Codespaces, Postgres in Docker | Test only | Anthropic API development key from the coaching phase |
| Test | Render, running the same Docker container, with managed Postgres | Test only | Anthropic API |
| Azure | Azure Container Apps with Azure Database for PostgreSQL | Real A3s after approval | Claude on Microsoft Foundry |

The app does not run on GitHub Pages, because it needs a server to hold the AI key, run the coach and reach the database. GitHub Pages serves only the static [A3 Workbench prototype](../prototype/a3-workbench). Secrets live in each host's environment settings, and in Azure Key Vault later, never in the repository.

## Promotion

1. Run validation, application tests and the production build on a PR using synthetic data. Keep preview credentials separate from production.
2. Review the preview against the baseline. For private workloads test authorised and unauthorised access, including direct API and deep-link requests.
3. Merge the approved revision and build once for production, or promote a previously built production-configured artifact for that exact revision. Record the commit and immutable deployment ID. Configure the host so a branch push cannot bypass release approval.
4. Smoke-test the production URL and confirm expected access and data version. On failure, select the previous compatible deployment and follow the [recovery steps](../CONTRIBUTING.md#release-and-recover).

[App checks](../.github/workflows/app.yml) and [Foundation checks](../.github/workflows/foundation.yml) validate the repository today. Configure deployment during the tester phase and record how to promote and roll back a release before inviting testers.
