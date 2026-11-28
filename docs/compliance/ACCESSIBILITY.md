# Accessibility status

> **Status: DRAFT for review.** This records what has been tested. It is not a formal accessibility statement. The Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018 require a published statement only from public sector bodies. If the operator is one, or the tool is used to deliver a public service, turn this into a statement using the GOV.UK model and publish it at `/accessibility`. The Equality Act 2010 duty to make reasonable adjustments applies either way.

Target: **WCAG 2.2 level AA** for both the A3 Coach app and the A3 Workbench.

## What was tested (28 November 2026)

- Automated: axe-core 4.10.3, WCAG 2.0, 2.1 and 2.2 A and AA rules plus best practice, in Chromium.
  - App: home, invite, privacy notice, My A3s (empty and with an A3), A3 workspace, an open section editor, version history. **0 violations.**
  - Workbench: Home, A3 sheet, Edit and Poster views, each in light and dark themes. **0 violations.** Some results are "incomplete" where axe cannot work out a background colour, for example over SVG.
- Keyboard spot checks: skip links, tab order through the header, the editor dialog's focus, and opening the Workbench's Edit view.

## Fixed in this round

| Issue | WCAG | Where |
| --- | --- | --- |
| Six charts had no text alternative | 1.1.1 | Workbench |
| White text on light fills in the dark theme (2.21:1, 1.64:1) | 1.4.3 | Workbench |
| Small label at 4.34:1 | 1.4.3 | App coach pane |
| Form field borders at about 1.5:1 | 1.4.11 | App |
| Field focus shown only by a 1px colour change | 2.4.7 | App |
| No skip link | 2.4.1 | App and Workbench |
| Scrollable table not reachable by keyboard | 2.1.1 | Workbench |
| Content outside landmarks; misused ARIA role | 1.3.1 (best practice) | Workbench |
| Form errors not announced | 4.1.3 | App invite and new A3 forms |

## Known limitations

- Charts have short text alternatives. Most of their data also appears as text nearby, but individual points on run charts do not. A hidden data table is planned.
- The Workbench shows dates in US format and uses some US spellings.
- The PDF poster is an image of the page inside a PDF, so its text is not selectable or readable by a screen reader. Share the live page or the A3 sheet view as the accessible version.
- ECharts output in the app has not been tested with a screen reader.

## Manual tests still to do

1. Keyboard only: create an A3, edit every section including adding and reordering rows, import a CSV, restore a version, sign out. In the Workbench: create an A3, fill every section, delete it, download the PDF.
2. Screen reader: NVDA with Firefox or Chrome on Windows, and VoiceOver with Safari on macOS or iOS, over the same journeys.
3. Zoom to 400% and reflow at 320 CSS pixels wide (WCAG 1.4.10).
4. Text spacing override (WCAG 1.4.12).
5. Colour-picker check of the axe "incomplete" items.
6. Target size of the small Edit and row buttons (WCAG 2.5.8). axe passed them, but check on a touch screen.

## Feedback

Testers who find something hard to use can contact `[CONTACT EMAIL]`. We aim to reply within `[5 working days]`.
