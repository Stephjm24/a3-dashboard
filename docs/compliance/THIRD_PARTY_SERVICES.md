# Third-party services and licences

Checked 28 November 2026. Update this file whenever a service or dependency is added or removed.

## Services

| Service | Used by | Status | What it receives | Role | Terms to have in place |
| --- | --- | --- | --- | --- | --- |
| GitHub (repository, Actions) | Development | In use | Code, docs, synthetic examples. CI uses throwaway test databases. | Provider to the developer | GitHub terms. Repository is **public**. |
| GitHub Pages | Workbench | In use | Visitors' IP addresses and request details | Host. Independent controller of its own logs. | GitHub terms and privacy statement |
| jsDelivr (cdn.jsdelivr.net) | Workbench PDF download | In use, on first PDF download only | Visitor's IP address and browser details. Not A3 content. | Independent provider | None needed. Could be removed by self-hosting the two libraries (action plan, part B). |
| claude.ai (Anthropic) | Hosted Workbench copy | In use, per owner | A3s, edits, comments and the names of people it is shared with | Platform | claude.ai terms for the owner's account. Owner to confirm sharing (C7). |
| Google Fonts | App build only | Build time | The build machine downloads Geist. Visitors' browsers never contact Google. | Not a recipient of user data | None |
| npm registry | Development and CI | In use | Package downloads | Not a recipient of user data | None |
| Render or similar container host | App, tester phase | **Planned** | All app data | Processor | Data processing addendum, region, sub-processors, backup and log retention |
| Microsoft Azure (Container Apps, PostgreSQL) | App, later | **Planned** | All app data | Processor | Organisation's Azure agreement and DPA. UK region. |
| Anthropic API | AI coach, phase 3 | **Planned** | Coach chat and the A3 being worked on | Processor | Commercial terms and DPA. US transfer mechanism. No training on API data. Retention settings. |
| Microsoft Foundry (Claude) | AI coach, later | **Planned** | As above, inside the Azure tenant | Processor | Organisation's Microsoft agreement |
| Microsoft Entra ID | Sign-in, later | **Planned** | Work identity claims | Organisation's own identity provider | Organisation's tenant settings |

There are no analytics, advertising, error-tracking, email or payment services.

## Workbench libraries (loaded from jsDelivr)

| Library | Version | Licence | Integrity |
| --- | --- | --- | --- |
| html2canvas | 1.4.1 | MIT | SRI sha384 pinned in `PDF_LIBS` |
| jsPDF | 4.2.1 | MIT | SRI sha384 pinned in `PDF_LIBS` |

## App dependencies

From `package-lock.json` on 28 November 2026. `npm audit` reported 0 known vulnerabilities on that date.

| Direct production dependency | Purpose | Licence |
| --- | --- | --- |
| next, react, react-dom | Framework | MIT |
| @prisma/client, @prisma/adapter-pg, pg | Database access | Apache-2.0 (Prisma), MIT (pg) |
| echarts | Charts | Apache-2.0 |
| exceljs | Reading .xlsx uploads | MIT |
| jszip | Checking a workbook's unpacked size before parsing | MIT or GPL-3.0-or-later (MIT elected) |
| zod | Input validation | MIT |
| server-only | Build guard | MIT |

Licences across all production packages: mostly MIT, ISC, Apache-2.0 and BSD. Items to note:

| Package | Licence | Shipped in the Docker image? | Note |
| --- | --- | --- | --- |
| @img/sharp-libvips-* (via Next.js) | LGPL-3.0-or-later | Yes (`.next/standalone/node_modules/@img`) | Fine for running a service. If the image is ever given to others, include the LGPL notice and the libvips source offer. |
| caniuse-lite | CC-BY-4.0 | Build only | Data used by build tools |
| buffers 0.1.1 (via exceljs → unzipper → binary) | **None declared** | Bundled into server code | **Needs verification.** Check the upstream repository, or replace when ExcelJS drops it. |
| elkjs, @visx/* (via Prisma Studio) | EPL-2.0, MIT and ISC | No | Development tool only |
| lightningcss | MPL-2.0 | No | Build tool only |

## Fonts, icons and images

| Asset | Source | Licence | Status |
| --- | --- | --- | --- |
| Geist, Geist Mono | Vercel, via `next/font/google` | SIL Open Font License 1.1 | OK |
| Frutiger (named in the Workbench font stack) | Not shipped. Used only if installed on the viewer's device. | Commercial | OK as long as no font file is added |
| Workbench arrow icon (inline SVG) | Appears to come from NHS.UK frontend | MIT if so | **Needs verification** |
| `src/app/favicon.ico` | Default create-next-app icon | Template default | Replace with an owned icon |
| README screenshots (`docs/images/`) | Screenshots of this project with synthetic data | Owner's | OK |
| NHS.UK design system styling | Colours and patterns re-implemented in CSS | NHS.UK frontend code is MIT. NHS identity is restricted to NHS organisations. | Owner decision (C4). No NHS logo used. |
