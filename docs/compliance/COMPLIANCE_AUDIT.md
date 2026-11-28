# Compliance audit: legal, privacy, security and accessibility

Audit date: 28 November 2026. Repository state: `main` at `2e0237f` (after the security pass in PR #14), plus the changes in this branch.

> This is technical compliance analysis and draft material for professional review. It is not legal advice, and it does not certify that either tool complies with any law or cannot face a claim. Statements about the law reflect UK GDPR, the Data Protection Act 2018, the Privacy and Electronic Communications Regulations 2003 (PECR), the Equality Act 2010, the Consumer Rights Act 2015, the Digital Markets, Competition and Consumers Act 2024 (DMCC Act) and WCAG 2.2 as understood at the audit date. Current regulator guidance was not re-checked online during this audit, and the Data (Use and Access) Act 2025 is being phased in, so confirm anything time-sensitive with the ICO or a qualified adviser.

Companion documents: [action plan and launch checklist](COMPLIANCE_ACTION_PLAN.md), [draft privacy notice](../legal/PRIVACY_POLICY.md), [draft tester terms](../legal/TERMS_OF_USE.md), [accessibility status](ACCESSIBILITY.md), [data retention and rights procedures](DATA_RETENTION.md), [third-party services and licences](THIRD_PARTY_SERVICES.md), [vulnerability reporting](../../SECURITY.md).

## 1. Executive summary

There are two separate products, and neither is a commercial or consumer service today.

- **A3 Coach** (`src/`) is an invite-only Next.js app with PostgreSQL. It is **built but not deployed anywhere**. It stores testers' email addresses, names and their A3s, which may name other people. It sets one strictly necessary cookie, sends no email, has no analytics and loads nothing from third parties.
- **A3 Workbench** (`prototype/a3-workbench/`) is a single public page on GitHub Pages, also shared as a claude.ai artifact. It has no server: work stays in the visitor's browser storage. It fetches two PDF libraries from jsDelivr when a PDF is first downloaded.

Overall, the risk is low while the tools are used as intended: a handful of invited testers, synthetic data, no payments, no marketing. The security baseline from PR #14 is sound, and owner-scoped access held when tested with two accounts. The real gaps were:

1. **No privacy information for testers** (UK GDPR Articles 13 and 14). Nothing told a tester who holds their data, why, for how long or how to exercise their rights. **Fixed in draft:** a privacy notice at `/privacy`, linked from the sign-in form and every page footer, and as Markdown. It cannot be finalised until the operator's identity, contact, host and retention facts are supplied.
2. **No way to answer access or erasure requests** short of hand-written SQL. Expired invites (which hold email addresses) were never removed. **Fixed:** `npm run user-data -- export | delete | purge`.
3. **Accessibility failures** found by automated testing: unlabelled charts, dark-theme contrast, a landmark error and an unreachable scroll region in the Workbench; low contrast, weak field focus, low-contrast field borders and no skip link in the app. **Fixed:** axe-core now reports no WCAG A or AA violations on any page tested, in light and dark themes. Manual screen reader testing is still needed.
4. **An unsupported claim.** The app home page said a coach "guides you" and "builds the A3 with you", but the coach is not built. **Fixed:** the wording now says the coach is planned.
5. **Decisions only the owner can make:** who the controller and operator are, whether the code is owned personally or by an employer, which licence (if any) the public repository carries, whether the NHS styling is acceptable, and the hosting provider and region. These block finalising the privacy notice and terms, not the testing itself.

**Before testers use a deployed A3 Coach**, the operator needs to: fill the privacy notice placeholders and approve it, choose the host and confirm its data processing terms and region, decide backup retention, and keep the "synthetic data only" rule. **Before the AI coach (phase 3)**: a data protection impact assessment (DPIA), Anthropic or Microsoft processor terms, an AI disclosure in the interface and an updated notice.

Not applicable: refunds, pricing, payment, marketing email and unsubscribe, reviews and testimonials, and children's protections. Each is explained in section 3.

## 2. What exists (phase 1 findings)

| Topic | Finding | Evidence |
| --- | --- | --- |
| Architecture | Next.js 16 (App Router, Server Actions), React 19, Prisma 7 with PostgreSQL, ECharts, ExcelJS, zod. Docker image with standalone output. | `package.json`, `next.config.ts`, `Dockerfile`, `prisma/schema.prisma` |
| Workbench | One HTML file with inline script, no framework, `a3.json` example data. Published to GitHub Pages by Actions with a generated Content Security Policy. | `prototype/a3-workbench/`, `scripts/pages_site.py`, `.github/workflows/prototype-pages.yml` |
| Deployment status | App: **not deployed**. Planned: temporary container host (e.g. Render) with test data, then Azure Container Apps. Workbench: live at stephjm24.github.io/a3-dashboard and as a claude.ai artifact. | `docs/delivery.md`, project design notes (round 3, item 16) |
| Audience and jurisdiction | The owner plus a few invited testers, each with their own login. The operator appears to be UK-based (British English, NHS-styled examples). No other market is targeted. **Needs verification:** where testers are located, and whether testing is done for an employer. | Project design notes (round 1, item 1) |
| Commercial status | No payments, prices, subscriptions or adverts anywhere. The repository is public but has no `LICENSE` file. | Repository search; no payment SDKs in `package-lock.json` |
| Personal data | App: email, name, account and invite timestamps, hashed session tokens, A3 content (may include named team members and mentor), IP addresses in memory for rate limiting. Workbench: whatever a visitor types, kept in their own browser. | `prisma/schema.prisma`, `src/lib/security/rate-limit.ts`, Workbench `localStorage` keys |
| Cookies and storage | App: one cookie, `__Host-a3_session`, `HttpOnly`, `Secure`, `SameSite=Lax`, 30 days. No `localStorage` or `sessionStorage`. Workbench: no cookies. `localStorage` keys `a3wb-mode` and `a3wb-draft-v1`. | Playwright run against a production build (section 6) |
| Third parties at runtime | App: none (0 third-party requests measured; Geist fonts are self-hosted by `next/font` at build time). Workbench: cdn.jsdelivr.net on first PDF download only. Hosts: GitHub Pages; claude.ai for the artifact copy. | Section 6 |
| Email | The app sends none. Invite links are printed in the operator's terminal and passed on by hand. | `scripts/create-invite.ts` |
| User-generated content | Yes, A3s. Private to their owner in the app. In the claude.ai copy, A3s and comments are shared with everyone the owner shares it with. | `src/lib/a3/repository.ts`, `prototype/a3-workbench/README.md` |
| Planned features with compliance impact | Phase 3 AI coach (Anthropic API now, Microsoft Foundry later) storing coaching turns and raw input. Entra ID sign-in. Mentor sharing. PDF export from the app. Real, possibly sensitive A3 data "eventually". | `docs/delivery.md`, `prisma/schema.prisma` (`CoachingTurn`, `RawInput`, `Draft`), design notes items 5 to 8 |
| Not verifiable here | Live GitHub settings (branch protection, secret scanning, Pages source), the claude.ai artifact's current sharing, hosting provider terms, who owns the code. | |

## 3. The 20 areas

Status key: **Verified** = verified compliant with the stated check only · **Partial** = partially implemented · **Not implemented** · **Needs verification** · **N/A** = not applicable.

### 1. Privacy policy

- **Applicability:** Applies to A3 Coach. Testers' email addresses and names are personal data, so Article 13 information must be given when the data is collected, and Article 14 information covers people named in A3s. It applies lightly to the Workbench, which processes no personal data on a server but should say so plainly.
- **Status before:** Not implemented. **Now:** Partial. A draft is in place but unapproved, with placeholders.
- **Evidence:** No privacy page or notice existed in `src/app`. The invite form collected a name with no information.
- **Risk:** Medium. Failure to inform is a transparency breach even for a small tester group.
- **Action taken:** Drafted [PRIVACY_POLICY.md](../legal/PRIVACY_POLICY.md) from confirmed facts only. Added `/privacy` ([src/app/privacy/page.tsx](../../src/app/privacy/page.tsx)) with a "Draft for review" banner, a link from the invite form at the point of collection, and a link in the footer of every page.
- **Still missing (owner to supply):** controller identity and address, privacy contact, DPO if any, ICO fee status, hosting provider and region, transfer mechanism, server log and backup retention, how testers will be told of changes, and confirmation of the lawful basis with a legitimate interests assessment.
- **Priority:** High, before any deployed tester use.
- **Verify:** Replace every `[...]`, remove the banner, have it reviewed, then check `/privacy` renders and both copies match.

### 2. Terms of service

- **Applicability:** Optional but useful. With no payment and no public sign-up, statutory consumer terms are not triggered. Short tester terms set expectations: prototype status, synthetic data only, no reliance, acceptable use and who owns the A3s.
- **Status:** Not implemented → draft only ([TERMS_OF_USE.md](../legal/TERMS_OF_USE.md)). Not linked from the app until approved.
- **Risk:** Low. The main exposure is a tester entering real confidential data, which the terms and the banner both address.
- **Action:** Draft for approval. Clauses marked **(legal review)**: liability, governing law, and the employment and IP position if testers are colleagues.
- **Priority:** Medium. **Verify:** owner approves and decides whether acceptance is needed at invite time. Recommendation: none. Link the terms instead of adding a checkbox.

### 3. Refund policy

- **N/A.** Nothing is sold. No payment code, SDK, price or subscription exists (`package.json`, routes). Revisit only if the tool is ever charged for.

### 4. Cookie policy

- **Applicability:** PECR regulation 6 applies to any storage on a user's device. Both tools use only storage that is strictly necessary for the service the user asked for: the app's session cookie and the Workbench's `localStorage` that remembers the user's own work and view.
- **Status:** Verified for the stated check: no non-essential cookies or storage exist. Measured in section 6.
- **Action:** No separate cookie policy. A cookie table sits inside the privacy notice, which is proportionate for one cookie. Create a standalone policy only if analytics or other non-essential technologies are added.
- **Priority:** Low. **Verify:** re-run the cookie and storage check after any new dependency.

### 5. Cookie consent banner

- **Applicability:** Not required. The strictly necessary exemption (PECR regulation 6(4)(b)) covers both tools' storage. A banner would add friction without legal benefit.
- **Status:** Verified for the stated check: no non-essential technologies run, so there is nothing to consent to. Deliberately not implemented.
- **Trigger to revisit:** any analytics, error-tracking SDK with identifiers, embedded media, or third-party fonts loaded at runtime. At that point, add consent before loading, an equal-weight "Reject" option, stored choice and a footer link to change it.

### 6. Form consent and privacy

- **Forms inspected:** invite acceptance (name), new A3 (title), section editors (A3 content), metrics import (file upload), sign-out, restore version. Workbench: local form only.
- **Status:** Partial → Verified for the stated check. All server inputs are validated with zod and length-capped, and uploads are size- and unpack-limited (PR #14). Errors are now announced to screen readers (`role="alert"` on invite and new A3 errors). The invite form now gives just-in-time privacy information with a link to the notice. No consent checkbox was added, correctly, because consent is not the lawful basis.
- **Risk:** Low. **Verify:** see section 6 (axe-core with forms open, keyboard order inside the editor dialog).

### 7. Data minimisation

- **Findings:** Fields collected are the minimum for sign-in: email and a display name. Uploaded files are parsed in memory and not stored (`readTableFile` in `src/app/a3/[id]/actions.ts`). Session and invite tokens are stored only as SHA-256 hashes. IP addresses are held only in memory, up to 15 minutes. Two gaps:
  1. **Expired invites and sessions were never purged.** Unused invites kept email addresses indefinitely. **Fixed:** `npm run user-data -- purge`. Schedule it, or run it monthly, once deployed.
  2. **A3s can name third parties** (team, mentor) and hold free text. **Mitigated by guidance** in the notice and terms. Consider prompting for roles rather than names in a later UI change.
- **Unused tables:** `Draft`, `CoachingTurn`, `RawInput`, `Upload` and `Review` exist for phases 3 and 4 but are never written today. `Upload.storageKey` implies files may be stored later. Revisit minimisation when those phases start.
- **Retention:** proposals in [DATA_RETENTION.md](DATA_RETENTION.md). An end-of-test deletion date is an owner decision.
- **Priority:** Medium.

### 8. Third-party SDK audit

- **Runtime services:** App: none in the browser. Workbench: jsDelivr (html2canvas 1.4.1 and jsPDF 4.2.1, Subresource Integrity pinned, loaded only on first PDF download), GitHub Pages hosting, claude.ai for the artifact copy. Planned: hosting (Render, Azure), Anthropic API or Microsoft Foundry.
- **Dependencies:** 11 production and 12 development direct packages. `npm audit` reported **0 vulnerabilities** on 28 November 2026. This shows no known advisories in the npm database on that date only, not that the packages are safe. Overrides for `effect` and `uuid` remain as documented in `docs/security.md`.
- **Unnecessary dependencies:** none found. `jszip` is a direct dependency used by `src/lib/a3/excel.ts` to check the unpacked size of a workbook before parsing it, which is a security control.
- **Processor terms needed:** the app host (once chosen), and Anthropic or Microsoft before phase 3. GitHub and jsDelivr act as independent providers for their own logs.
- **Option (draft for approval):** self-host the two PDF libraries in the Pages build to remove the jsDelivr request entirely. This is a small change to `scripts/pages_site.py`, its test and the Content Security Policy. It was not done here because it changes what Pages publishes.
- Full table: [THIRD_PARTY_SERVICES.md](THIRD_PARTY_SERVICES.md). **Priority:** Low now, High before phase 3.

### 9. Dark pattern assessment

- **Reviewed:** invite acceptance, sign-out, A3 delete in the Workbench, the editor's discard prompt, version restore.
- **Status:** Verified for the stated check: no pre-ticked boxes, no confirmshaming, no hidden choices, no forced continuity. Sign-out is one click. Destructive actions are clearly labelled ("Delete" / "Keep it"; "Discard your changes to this section?").
- **Observation:** there was no way for a tester to delete their own account. Erasure now runs through a request to the operator, which the privacy notice explains. A self-service "Delete my account" button is a reasonable later improvement, but not required for a few testers.

### 10. Hidden fees and pricing transparency

- **N/A.** There is no charge. If the tool is ever sold to consumers, the DMCC Act 2024 drip-pricing and subscription contract rules would apply.

### 11. Fake reviews and testimonials

- **N/A**, checked. No reviews, ratings, endorsements or testimonials appear in either tool or the README. The example A3 ("Late lab results delay ER discharges") and its people (Jordan Lee, Sam Patel) are fictional and are labelled "Example" and "synthetic". Keep it that way: the DMCC Act bans fake reviews outright.

### 12. Unsupported claims

| Where | Claim | Finding | Action |
| --- | --- | --- | --- |
| App home (`src/app/page.tsx`) | "A coach guides you through A3 thinking … and builds the A3 with you." | **Unsupported**: the coach is a placeholder until phase 3. | **Changed** to describe what exists and say the coach is planned. |
| Workbench home | "8 sections", "6 charts and diagrams", "1 A3 page" | Verified against the code: 8 sections; run, bullet, fishbone, matrix, Gantt and follow-up charts; one A3 landscape PDF page. | None. |
| Workbench home | "Nothing you type is sent anywhere" | True of content. Incomplete about network requests. | **Expanded** to name local storage, shared computers and the jsDelivr request. |
| Workbench footer | "Built on the NHS.UK design system" | It is styled on it, not affiliated with the NHS. Could imply NHS endorsement. | **Changed** to "Styled on the NHS.UK design system. Not an NHS service." **Owner to confirm** (section 4, item C4). |
| `docs/security.md` | Lists controls as in place | Spot-checked: headers, cookie flags, owner filtering and rate limits all match the running build. | None. |
| App header | "Proof of concept · test data only" | Accurate. | None. |

### 13. Image alternative text

- **App:** every chart has `role="img"` with a descriptive `aria-label` (`src/components/a3/charts/echart.tsx`, `a3-chart.tsx`). The 5 Whys and fishbone have labels. Decorative symbols (⚠) are `aria-hidden`. There are no `<img>` elements in the app UI. **Verified** by axe-core.
- **Workbench:** **6 SVG charts had `role="img"` and no text alternative** (axe `svg-img-alt`, serious). **Fixed:** each chart function now takes a label, and the run and follow-up charts name the metric. The poster thumbnail already had a label.
- **README images:** all six screenshots have meaningful alt text. **Verified** by reading `README.md`.
- **Remaining:** short labels identify each chart. The data behind most charts also appears as text (KPI tiles, tables, why-chains), but the run chart's individual points do not. A visually hidden data table would give full equivalence (WCAG 1.1.1, best practice). **Later.**

### 14. Colour contrast

- **App:** one failure. The coach pane's section label (`text-slate-500` on `bg-slate-100`) measured **4.34:1** against the 4.5:1 requirement. **Fixed:** `text-slate-600`. Form field borders (`slate-300`, about 1.5:1) failed **1.4.11 non-text contrast** for identifying inputs. **Fixed:** `slate-500`.
- **Workbench, dark theme:** white text on the green primary button, the dark-blue "root cause" chip and the insight headline measured **2.21:1, 1.64:1 and 1.64:1**. **Fixed** with an `--on-fill` token (white in light, near-black in dark), which keeps the NHS palette. The danger button and the "Start a new A3" arrow had the same pattern and use the same token.
- **Now:** axe-core reports 0 contrast violations on every page tested, light and dark. Some "incomplete" results remain where axe cannot compute a background, such as text over gradients and SVG. **Needs manual verification** with a colour picker on those elements.

### 15. Keyboard navigation

- **App:** native links, buttons and `<dialog>` with `showModal()`, which keeps focus inside the dialog and returns it on close. Escape closes the dialog, asking first if there are unsaved changes. **There was no skip link. Fixed:** a "Skip to main content" link is the first tab stop and moves focus to `<main>`. **Field focus was a 1px colour change only. Fixed:** a 2px blue outline.
- **Workbench:** good NHS-style yellow focus already. Fixed: a skip link; the countermeasure and task tables and the chart scrollers can now receive focus so they can be scrolled with arrow keys (axe `scrollable-region-focusable`); `nav role="group"` became a `div`; one `<main>` now contains both Home and the A3 views (axe `landmark-one-main`, `region`).
- **Verified:** tab order and skip-link behaviour in Playwright, and Edit view opens by keyboard. **Not verified:** the full Workbench editing flow and PDF download by keyboard alone, and screen reader announcements. These need a manual test with NVDA or VoiceOver.

### 16. Business and operator details

- **Applicability:** depends on facts not available. If the operator is a company, the Companies (Trading Disclosures) Regulations 2008 require its registered name, number and office on its websites. If the tool were offered as an information society service, normally for payment, the Electronic Commerce Regulations 2002 (regulation 6) would require name, address and email. For an unpaid tester pilot, UK GDPR's controller identity requirement is the one that clearly applies.
- **Status:** Not implemented. Needs owner information.
- **Action:** the placeholder `[OPERATOR NAME]`, address and contact sit in the privacy notice and terms. Do not publish either until filled. No company details have been invented.
- **Priority:** High, before deployed tester use.

### 17. Children's privacy and age

- **N/A** on the evidence. A3 Coach is invite-only, and invites are issued by the operator to named adult colleagues or testers. The Workbench is a workplace problem-solving tool with no sign-up and no server-side data, so it is unlikely to attract children, and the ICO Children's Code is not considered engaged. No age gate has been added. Revisit if the app is ever opened to public sign-up.

### 18. Email unsubscribe

- **N/A.** No email of any kind is sent by either tool. Invites are passed on by the operator personally. If automated invite or notification emails are added later, those are service messages, which need no unsubscribe link but should identify the sender. Any marketing email would need PECR consent or the soft opt-in, plus an unsubscribe link in every message.

### 19. Image, media and software licensing

- **Dependencies:** production licences are permissive (MIT, ISC, Apache-2.0, BSD) apart from: **sharp's libvips binaries (LGPL-3.0-or-later)**, which are included in the Docker image via Next.js image optimisation. LGPL is compatible with this use, but if the image is ever distributed to third parties, LGPL notice and relinking obligations apply. **jszip** is dual MIT or GPL-3.0, so MIT can be elected. **buffers@0.1.1** (via ExcelJS → unzipper) declares no licence: **Needs verification.** Development-only EPL-2.0 and MPL-2.0 packages (Prisma Studio, the Lightning CSS toolchain) are not shipped. Details: [THIRD_PARTY_SERVICES.md](THIRD_PARTY_SERVICES.md).
- **Fonts:** Geist and Geist Mono (SIL Open Font License 1.1), self-hosted. The Workbench names Frutiger first in its font stack but ships no font file, so Frutiger appears only where already installed. No licence issue, but non-NHS users will see Arial.
- **Icons and images:** the Workbench arrow icon appears to come from NHS.UK frontend (MIT). **Needs verification** of origin. `src/app/favicon.ico` is the default create-next-app icon. Replace it with an owned icon. README screenshots are of this project's own pages with synthetic data.
- **NHS identity:** the NHS logo is not used, and the README says so. NHS Blue, layout patterns and the Frutiger name are used. The NHS identity guidelines restrict the NHS identity to NHS organisations and services. **Owner decision:** keep the styling with the "Not an NHS service" line, or re-skin before wider sharing.
- **AI-generated material:** the code, documents and example content were largely produced with Claude. Copyright in AI-assisted output is not settled, and section 9(3) of the Copyright, Designs and Patents Act 1988 (computer-generated works) is under review. Do not assume the repository is free of third-party rights or that the operator holds full copyright.
- **Repository licence:** **there is no `LICENSE` file**, so by default others may view but not reuse the code. Whether to add one depends on who owns the code: if it was written in the course of employment, the employer likely owns it (CDPA s.11(2)). **Owner decision.**
- **Priority:** Medium.

### 20. Data deletion and user rights

- **Before:** no mechanism. A3s had no cascade from users, so deleting a user by hand would fail on the foreign key.
- **Now:** `npm run user-data -- export <email>` produces a JSON copy for access and portability requests (token hashes excluded). `delete <email> --confirm` removes the account, invites, sessions and every A3 with all versions, drafts, coaching turns, inputs, uploads and reviews, in one transaction. `purge` removes expired sessions and unused expired invites. Logic: [src/lib/privacy/user-data.ts](../../src/lib/privacy/user-data.ts), with unit tests. Run against PostgreSQL in section 6.
- **Limits stated honestly:** deletion does not reach hosting provider backups or logs. Workbench data lives only in the visitor's browser, and the operator cannot reach it. The claude.ai copy's shared data is deleted through claude.ai.
- **Procedure:** [DATA_RETENTION.md](DATA_RETENTION.md) covers verifying identity, the one-month deadline, a rights log and the backup caveat.
- **Status:** Partial. The tooling is done; the procedure needs an owner contact and a backup retention period.

## 4. Additional risks (phase 3)

| # | Area | Finding | Status | Action |
| --- | --- | --- | --- | --- |
| X1 | Authentication and authorisation | Invite tokens (256-bit), hashed at rest, single-use and claimed atomically. Owner-scoped queries tested: user 2 opening user 1's A3 and history got "not found" with no title leaked. Reused invite refused. | Verified for the stated check | Keep `getA3`/`listA3s` as the only access path. Add an automated two-user test when an end-to-end suite exists. |
| X2 | Roles | Single role. No admin UI. The operator uses the command line with database access. | Verified for the stated check | When mentor sharing arrives, add explicit share grants and test them. |
| X3 | Secrets | `.env` git-ignored and Docker-ignored, CI secret scanner (`scripts/check.py`). `docker-compose.yml` holds a local-only database password, bound to 127.0.0.1. | Verified for the stated check | Confirm GitHub secret scanning and push protection are on (repository settings, not visible here). |
| X4 | Public repository | Public: code, docs, screenshots and the example A3 are visible to anyone. All are synthetic. Project emails and employer details are not in the repository. | Needs verification | Before committing, check new screenshots and fixtures contain no real names. Confirm the public repo is intended (see licence decision). |
| X5 | Security headers and HTTPS | CSP, HSTS, `X-Frame-Options`, `nosniff`, referrer and permissions policies measured on the production build. HTTPS is enforced by HSTS and `upgrade-insecure-requests` once hosted. | Verified for the stated check | Confirm the host terminates TLS and redirects HTTP. |
| X6 | XSS and injection | React escaping in the app. Workbench `esc()` on every interpolation and CSP by script hash. Prisma parameterises queries. | Verified for the stated check (PR #14) | None. |
| X7 | Search engine exposure | Only invite pages were `noindex`. | Fixed | All app pages now send `noindex, nofollow` while it is a private pilot. |
| X8 | Logging | The app logs no personal data deliberately. Next.js logs server errors, which can include messages but not request bodies by default. Host logs will include IP addresses. | Needs verification | Check the host's log retention and record it in the notice. |
| X9 | Backup and recovery | Not configured. The app is not deployed. | Not implemented | Choose a host with point-in-time restore. Record the backup retention period, which also bounds erasure. Test a restore before testers rely on the data. |
| X10 | Incident and breach response | No documented process. UK GDPR requires notifying the ICO within 72 hours of becoming aware of a reportable breach. | Fixed in draft | Procedure in [DATA_RETENTION.md](DATA_RETENTION.md#personal-data-breaches). `SECURITY.md` for vulnerability reports. Owner to supply the contact. |
| X11 | Rate limits in memory | Per-process only, as documented. | Accepted for one instance | Move to a shared store before running several replicas. |
| X12 | AI (phase 3) | Not built. When built, it will send tester text to Anthropic (US) or Microsoft Foundry. Needs a DPIA (new technology plus possibly sensitive A3s), processor terms, a transfer mechanism, retention settings at the provider, a visible "AI-generated draft" label (already in the design as drafts the person accepts), and an updated notice. | N/A today; planned | Gate phase 3 on the checklist in [COMPLIANCE_ACTION_PLAN.md](COMPLIANCE_ACTION_PLAN.md#before-the-ai-coach-phase-3). |
| X13 | claude.ai hosted copy | Anyone it is shared with can edit and comment, and data sits in claude.ai under Anthropic's terms. | Needs verification | Owner to confirm who it is shared with. Keep it to synthetic data. |
| X14 | Accessibility beyond the listed items | Reflow, zoom to 400% and screen reader behaviour of ECharts SVG not tested. Workbench dates show in US format (e.g. "Nov 27, 2026") and uses US spellings ("Standardize", "ER"). | Needs verification | Manual test plan in [ACCESSIBILITY.md](ACCESSIBILITY.md). Switch the date format to en-GB in a later Workbench change. |
| X15 | Special category data | Design notes say A3s "will contain sensitive data eventually", and the example is clinical. Health data would need an Article 9 condition, a DPIA and tighter hosting (the Azure tenant plan). | N/A today | Keep the "synthetic data only" rule until a DPIA approves otherwise. |

## 5. Scorecard

| Area | Applicability | Current status | Risk | Required action | Priority |
| --- | --- | --- | --- | --- | --- |
| 1 Privacy policy | Applies (app); light (Workbench) | Partial (draft in app and docs) | Medium | Fill placeholders, legal review, approve | High |
| 2 Terms of service | Optional, recommended | Partial (draft only) | Low | Approve; legal review of marked clauses | Medium |
| 3 Refund policy | Not applicable | Not applicable | None | None | — |
| 4 Cookie policy | Applies (one necessary cookie) | Verified compliant with the stated check (covered in notice) | Low | Re-check after any new dependency | Low |
| 5 Consent banner | Not required | Verified compliant with the stated check (none needed) | Low | Add only if non-essential tech is introduced | Low |
| 6 Form consent and privacy | Applies | Verified compliant with the stated check | Low | None | Low |
| 7 Data minimisation | Applies | Partial | Medium | Schedule `purge`; set end-of-test deletion | Medium |
| 8 Third-party SDKs | Applies | Partial | Low now, High at phase 3 | Host processor terms; optionally self-host PDF libs | Medium |
| 9 Dark patterns | Applies | Verified compliant with the stated check | Low | None | Low |
| 10 Pricing transparency | Not applicable | Not applicable | None | None | — |
| 11 Reviews and testimonials | Not applicable (none exist) | Not applicable | None | Keep examples labelled synthetic | — |
| 12 Unsupported claims | Applies | Verified compliant with the stated check (after fixes) | Low | Owner to confirm "Not an NHS service" wording | Medium |
| 13 Alt text | Applies | Verified compliant with the stated check (automated) | Low | Optional data tables for charts | Low |
| 14 Colour contrast | Applies | Verified compliant with the stated check (automated); manual check of "incomplete" items | Low | Manual colour-picker check | Medium |
| 15 Keyboard navigation | Applies | Partial (fixed and spot-tested; full manual pass outstanding) | Medium | Full keyboard and screen reader test | Medium |
| 16 Operator details | Applies | Not implemented (placeholders) | Medium | Owner to supply identity and contact | High |
| 17 Children | Not applicable | Not applicable | None | Revisit if sign-up opens | — |
| 18 Email unsubscribe | Not applicable | Not applicable | None | Revisit if email is added | — |
| 19 Licensing | Applies | Needs verification | Medium | Decide repo licence and ownership; check `buffers` licence; replace favicon; NHS styling decision | Medium |
| 20 Deletion and rights | Applies | Partial (tooling done) | Medium | Owner contact, backup retention, rights log | High |
| X1 Access control | Applies | Verified compliant with the stated check | Low | Automated two-user test later | Low |
| X3 Secrets | Applies | Verified compliant with the stated check | Low | Confirm GitHub secret scanning | Low |
| X5 Headers and HTTPS | Applies | Verified compliant with the stated check | Low | Confirm TLS at host | Low |
| X7 Search indexing | Applies | Verified compliant with the stated check | Low | None | Low |
| X8 Logging | Applies at deployment | Needs verification | Low | Record host log retention | Medium |
| X9 Backups | Applies at deployment | Not implemented | Medium | Choose host, set retention, test restore | High (pre-deploy) |
| X10 Breach response | Applies | Partial (procedure drafted) | Medium | Owner contact; rehearse once | High |
| X12 AI coach | Planned | Not applicable (not built) | High when built | DPIA, processor terms, disclosure | High (pre-phase 3) |
| X13 claude.ai copy | Applies | Needs verification | Low | Confirm sharing; synthetic data only | Low |
| X15 Special category data | Planned | Not applicable (synthetic only) | High if real data used | DPIA before any real data | High (pre-real data) |

No overall score or percentage is given. A number would imply a legal certainty this audit cannot offer.

## 6. Verification report

All checks ran on 28 November 2026 against a production build (`next build` then `next start`) with PostgreSQL 16 locally, and the Pages build of the Workbench (`scripts/pages_site.py`) served locally. Chromium via Playwright, axe-core 4.10.3 with the WCAG 2.0, 2.1 and 2.2 A and AA rule sets plus best practice.

| Check | Before | After | Result |
| --- | --- | --- | --- |
| `npm run lint` | pass | pass | Passed |
| `npm run typecheck` | pass | pass | Passed |
| `npm test` (Vitest) | 38 tests pass | 44 tests pass (6 new for user data) | Passed |
| `npm audit` | 0 vulnerabilities | no dependency change | Passed (snapshot only) |
| `npm run build` | pass | pass, `/privacy` static | Passed |
| Python foundation checks (`scripts/check.py`) and `tests/` | pass | "Foundation checks passed", 12 Python tests OK | Passed |
| axe, app: home, invite, My A3s, A3 workspace, editor dialog, history, privacy | 1 contrast violation (workspace) | 0 violations | Passed (automated only) |
| axe, Workbench: home, sheet, edit, poster × light and dark | 3 to 5 violation types per view (svg-img-alt ×6, dark contrast, landmarks, scroll region, ARIA role) | 0 violations | Passed (automated only). "Incomplete" items need a manual check. |
| Keyboard: first tab stop is the skip link, Enter moves focus to `<main>` (app and Workbench) | No skip link | Works | Passed |
| Keyboard: focus enters the editor dialog on open, visible outline on fields | 1px colour change | 2px outline | Passed |
| Response headers on `/` | Present | Unchanged | Passed |
| Cookies after sign-in | 1: `__Host-a3_session`, HttpOnly, Secure, Lax, 30 days | Unchanged | Passed |
| Browser storage, app | none | none | Passed |
| Third-party requests, app | — | 0 | Passed |
| Workbench storage and requests | `a3wb-mode` only; no requests until PDF | Unchanged | Passed |
| PDF download, Workbench | — | Not completed: the sandbox cannot reach cdn.jsdelivr.net | **Unverified.** Test PDF download on the Pages preview after merge. |
| Two-user isolation | — | User 2 gets "not found" for user 1's A3 and history | Passed |
| Invite reuse | — | Refused with the expected message | Passed |
| `user-data export / delete / purge` against PostgreSQL | — | Export JSON correct with no token hashes; delete without `--confirm` refused; delete removed 1 A3, 1 session, 1 invite and the user; export afterwards "Nothing is stored"; purge removed 1 expired invite | Passed |
| Visual check of the Workbench dark theme after token change | — | Screenshot reviewed: buttons and chips readable, palette unchanged | Passed |
| Screen reader (NVDA, VoiceOver), zoom 400%, reflow at 320px | — | — | **Not tested** |
| Legal review of drafts | — | — | **Not done**: requires a qualified reviewer |

Passing these checks shows the stated technical controls work. It does not establish legal compliance.
