# Delivery plan

| Phase | Dependency | Actions and deliverables | Complete when |
| --- | --- | --- | --- |
| 1 · Repository | Private destination selected | Initialise main, add navigation, file conventions, ownership guidance and a reviewed foundation change. | A fresh checkout passes the documented checks. Inspect the remote main tree and record actual protection status. |
| 2 · Application integration | Working export or existing source revision, its assets and reproducible run instructions | Inventory routes, entry point, dependencies, source of displayed values and any external calls. Run the original in isolation. Record screenshots or expected behaviour using synthetic content. Import on a branch, preserving relative paths and lockfile. Review collisions before replacing files. | The imported app starts from a clean checkout and matches the source baseline on its existing views, interactions and assets. Document the exact dev/build commands. |
| 3 · Data readiness | First real use case, source owner and consumer | Replace example-only assumptions with an agreed contract, synthetic fixture, invalid case and data provider. Map source fields and record classification and provenance. | The same consumer renders the valid fixture and a representative approved input. Invalid input fails predictably. Fixture and live sources are selected explicitly. |
| 4 · Development workflow | Baseline commands from phase 2 | Keep foundation CI. Add stack-native formatter/linter, type checks where applicable, existing tests and production build using the locked dependencies. Add smoke coverage for the most important confirmed interaction. | A clean PR run builds the app. An intentionally failing test blocks promotion. Record checks to require on main. |
| 5 · Deployment | Audience, routing, runtime, data location, credentials and account ownership confirmed | Choose a host and configure build root, output, rewrites and environments. Build one identified revision and review its synthetic preview. Test direct route navigation, refresh, asset loading and access controls. Promote the approved artifact. | The deployed version maps to a commit. Required access checks pass and a rollback rehearsal restores the prior version. |
| 6 · Population | Agreed contract, delivery path and data owner approval | Review the first dataset, compare counts and values with its source, verify a small representative sample, record refresh and correction procedures. For operational data test repeat imports and access by role. | An owner can trace a displayed value to its source revision, reproduce the update, identify rejected records and recover the last good version. |

## Hosting decision

Keep the foundation private with CI only. The first hosting decision depends on who can open the dashboard, how it routes URLs and whether it needs server-side secrets, APIs or writes. A private source repository alone does not establish site access controls.

| Candidate | Best fit and trade-off |
| --- | --- |
| GitHub Pages | Preferred first demo when the existing application exports static assets and every bundled value is approved for its audience. Configure the project subpath and test deep links. Supply a separate authenticated API for private operations. Check private-repository Pages eligibility before enabling it. |
| Vercel | Evaluate first if the source already depends on a supported server-rendered framework. Preview deployments make PR review practical. Configure preview access, environment isolation and controlled promotion before connecting production. |
| Netlify | Suitable for a static SPA needing explicit rewrites, PR previews or a small function API. Test route fallback with real deep links and confirm function limits against actual requests. |
| Cloudflare Pages | Useful for a static front end with lightweight server-side Functions. Verify Workers runtime compatibility with existing backend libraries before choosing this path. |
| An organisation-approved application host | Preferred for restricted operational use when identity, private networking or data location requirements constrain the choice. Reuse existing identity and an approved managed data service where possible. |

## Promotion

1. Run validation, application tests and the production build on a PR using synthetic data. Keep preview credentials separate from production.
2. Review the preview against the baseline. For private workloads test authorised and unauthorised access, including direct API and deep-link requests.
3. Merge the approved revision and build once for production, or promote a previously built production-configured artifact for that exact revision. Record the commit and immutable deployment ID. Configure the host so a branch push cannot bypass release approval.
4. Smoke-test the production URL and confirm expected access and data version. On failure, select the previous compatible deployment and follow the recovery steps in CONTRIBUTING.md.

The foundation workflow checks repository and sample data quality. Add deploy automation after the hosting decision, including any required environment approval and least-privilege deploy identity.

Provider documentation: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [Vercel environments](https://vercel.com/docs/deployments/environments), [Netlify previews](https://docs.netlify.com/deploy/deploy-types/deploy-previews/), [Cloudflare Functions](https://developers.cloudflare.com/pages/functions/), [protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches), [Actions security](https://docs.github.com/en/actions/reference/security/secure-use).
