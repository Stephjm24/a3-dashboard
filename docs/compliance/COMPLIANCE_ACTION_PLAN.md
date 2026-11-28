# Compliance action plan

Follows from the [compliance audit](COMPLIANCE_AUDIT.md) of 28 November 2026. Draft material for the product owner's review, not legal advice.

## A. Implemented in this change

| Change | Files | Evidence |
| --- | --- | --- |
| Privacy notice page with a draft banner, linked from the sign-in form and the footer of every page | `src/app/privacy/page.tsx`, `src/components/forms.tsx`, `src/app/layout.tsx` | `/privacy` builds as a static page. axe: 0 violations. |
| Just-in-time privacy wording on the invite form, and errors announced with `role="alert"` | `src/components/forms.tsx` | axe on the invite page: 0 violations |
| Data rights tooling: `npm run user-data -- export`, `delete --confirm`, `purge` | `src/lib/privacy/user-data.ts`, its test, `scripts/user-data.ts`, `package.json` | 6 unit tests. Run against PostgreSQL (audit section 6). |
| All app pages marked `noindex, nofollow` during the private pilot | `src/app/layout.tsx` | Checked in the HTML of `/privacy` |
| App skip link and focusable `<main>` | `src/app/layout.tsx` | First tab stop, moves focus to main |
| App field focus outline and 3:1 field borders | `src/components/forms.tsx`, `src/components/a3/editors/fields.tsx`, `src/components/a3/editors/metrics-editor.tsx` | Playwright: 2px solid outline on focus |
| App coach pane contrast, 4.34:1 to above 4.5:1 | `src/components/a3/coach-pane.tsx` | axe: 0 contrast violations |
| App home page claim corrected (coach not yet built) | `src/app/page.tsx` | Text review |
| Workbench chart text alternatives (6 charts) | `prototype/a3-workbench/index.html` | axe `svg-img-alt` cleared |
| Workbench dark theme contrast (`--on-fill`, `--good-hover` tokens) | `prototype/a3-workbench/index.html` | axe: 0 contrast violations in dark; screenshot reviewed |
| Workbench skip link, one `<header>`, one `<main>`, `nav role="group"` replaced | `prototype/a3-workbench/index.html` | axe `landmark-one-main`, `region`, `aria-allowed-role` cleared |
| Workbench scrollable tables and charts reachable by keyboard | `prototype/a3-workbench/index.html` | axe `scrollable-region-focusable` cleared |
| Workbench Home: clearer storage and jsDelivr disclosure; footer says "Styled on the NHS.UK design system. Not an NHS service." | `prototype/a3-workbench/index.html` | Text review. **Confirm wording (C4).** |
| Vulnerability reporting policy | `SECURITY.md` | GitHub shows it on the Security tab |

Merging to `main` republishes the Workbench to GitHub Pages through the existing workflow. Merging is the approval for that. The claude.ai copy is **not** republished by this change.

## B. Drafted for approval

| Item | File | What is needed |
| --- | --- | --- |
| Privacy notice | [docs/legal/PRIVACY_POLICY.md](../legal/PRIVACY_POLICY.md) and `/privacy` | Fill placeholders, legal review of the lawful basis and transfers, approve, then remove the draft banner |
| Tester terms of use | [docs/legal/TERMS_OF_USE.md](../legal/TERMS_OF_USE.md) | Approve, legal review of marked clauses, decide whether to link from the footer |
| Retention schedule and rights procedure | [DATA_RETENTION.md](DATA_RETENTION.md) | Confirm the proposed periods, name the contact |
| Breach response procedure | [DATA_RETENTION.md](DATA_RETENTION.md#personal-data-breaches) | Name who decides and who reports |
| Accessibility status | [ACCESSIBILITY.md](ACCESSIBILITY.md) | Approve; complete the manual tests |
| Self-host the two PDF libraries in the Pages build | none yet | Decide. This removes the jsDelivr request but changes what Pages publishes. |
| Self-service "Delete my account" in the app | none yet | Decide. Optional for a few testers; the command-line route meets the requirement. |

## C. Needs information from the owner

| # | Question | Why it matters |
| --- | --- | --- |
| C1 | Who is the controller and operator: you personally, or your employer? Name, postal address and privacy contact email. | Required in the privacy notice (Article 13) and terms. Also decides who owns the code. |
| C2 | Is testing part of your job, and are testers colleagues? | Affects the lawful basis, employer policies (IT, AI use, data protection) and IP ownership. |
| C3 | Which host and region for the tester deployment (Render, Azure, other)? Backup and log retention? | Recipients, international transfers and how long erased data survives in backups. |
| C4 | Keep the NHS.UK styling with "Not an NHS service", or re-skin? Is the operator an NHS body? | NHS identity rules. "Not an NHS service" would be wrong if the operator is an NHS organisation. |
| C5 | Licence for the public repository: none (all rights reserved), an open-source licence, or make the repository private? | Without a licence nobody may reuse the code. If the employer owns it, they decide. |
| C6 | When does the tester phase end, and should all tester data then be deleted? | Sets the account retention period, which is currently "until deleted". |
| C7 | Is the claude.ai hosted copy still in use, and who is it shared with? | It holds shared edits and comments under Anthropic's terms. |
| C8 | Where are testers located? | If any are in the EU, the EU GDPR may apply alongside UK GDPR. |
| C9 | Do you pay the ICO data protection fee, or is the controller exempt? | Fee and registration number in the notice. |

## D. Not applicable

Refund policy (3), pricing transparency (10), reviews and testimonials (11), children's protections (17) and email unsubscribe (18): no payments, reviews, child audience or email exist. A cookie consent banner (5) and a separate cookie policy (4) are not needed while only strictly necessary storage is used. Each reason is in the audit.

## Prioritised plan

### Immediate (this PR, then owner answers)

1. Review and merge this PR. Check the Workbench on Pages afterwards, including **Download PDF**, which could not be tested here.
2. Answer C1 to C9.
3. Fill the privacy notice and terms placeholders, then get them reviewed.

### Before testers use a deployed A3 Coach

1. Choose the host (C3). Sign or accept its data processing terms. Record the region and the transfer mechanism.
2. Turn on automated backups with a known retention period, and test one restore.
3. Approve the privacy notice and remove the draft banner. Tell testers where it is.
4. Schedule `npm run user-data -- purge` monthly (a host cron job or a calendar reminder).
5. Set up the rights log and the breach procedure contact.
6. Confirm GitHub secret scanning, push protection and branch protection are on.
7. Run the manual accessibility checks in [ACCESSIBILITY.md](ACCESSIBILITY.md).

### Before the AI coach (phase 3)

1. A DPIA covering the AI provider, what is sent, retention at the provider and the possibility of sensitive A3 content.
2. Processor terms with Anthropic (commercial terms and data processing addendum) or Microsoft (Foundry within the Azure tenant). Confirm the provider does not train on API data and set the shortest available retention.
3. A transfer mechanism for any US processing.
4. An interface notice beside the coach chat: "Replies are written by an AI model and can be wrong. Nothing goes into your A3 until you accept it." Label AI drafts as such, as the design already plans.
5. Update the privacy notice and tell testers before switching it on.
6. Decide retention for `coaching_turns` and `raw_inputs`. They hold the person's words exactly as typed.

### Before any real or sensitive data

1. A DPIA with an Article 9 condition if any health or other special category data could be entered.
2. Hosting inside the organisation's Azure tenant, Entra ID sign-in, and access reviews.
3. Encryption at rest confirmed at the host, and audit logging of operator database access.

### Later improvements

- Visually hidden data tables for charts (WCAG 1.1.1 best practice).
- en-GB dates and spellings in the Workbench.
- A self-service account deletion button.
- An end-to-end two-user isolation test in CI.
- A rate limiter backed by a shared store before scaling beyond one instance.
- Replace the default `favicon.ico`.

## Where everything lives in the repository

| Material | Location |
| --- | --- |
| Audit, action plan, accessibility, retention, third parties | `docs/compliance/` |
| Drafts of public-facing legal text | `docs/legal/` |
| Vulnerability reporting | `SECURITY.md` (repository root, recognised by GitHub) |
| Security controls | `docs/security.md` (existing) |
| In-app privacy notice | `src/app/privacy/page.tsx`, served at `/privacy` |
| Rights tooling | `src/lib/privacy/`, `scripts/user-data.ts` |
| Future routes, once approved | `/terms` for the terms of use, `/accessibility` only if an accessibility statement becomes legally required (for example if a public sector body runs it) |

## Launch-readiness checklist

Tick before inviting testers to a deployed A3 Coach.

- [ ] Operator identity, contact and controller confirmed (C1, C2)
- [ ] Privacy notice placeholders filled, reviewed and approved; draft banner removed from `/privacy`
- [ ] Tester terms approved, or a decision recorded not to use them
- [ ] Host chosen; data processing terms accepted; region and transfers recorded in the notice
- [ ] HTTPS live and HTTP redirected; security headers checked on the live address
- [ ] Backups on, retention recorded, one restore tested
- [ ] `DATABASE_URL` and `APP_URL` set as host secrets, not in the repository
- [ ] `purge` scheduled; rights log created; breach contact named
- [ ] GitHub secret scanning, push protection and branch protection confirmed
- [ ] Manual accessibility checks done (keyboard-only pass, NVDA or VoiceOver, 400% zoom)
- [ ] Testers told: synthetic data only, where the privacy notice is, how to ask for deletion
- [ ] Workbench: PDF download tested on Pages; NHS styling decision recorded (C4)
- [ ] Repository licence decision recorded (C5)
- [ ] AI coach **off** until the phase 3 list above is complete
