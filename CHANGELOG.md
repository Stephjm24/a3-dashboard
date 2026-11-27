# Changelog

## Unreleased

- Added the Prototype Pages workflow, which publishes the A3 Workbench prototype to GitHub Pages when it changes on `main`.
- Added the A3 Workbench prototype in `prototype/a3-workbench`: a single page with NHS styling for filling in an A3, viewing it as a one-page A3 with charts and coach notes, and downloading it as a PDF. It is for collecting feedback and is separate from the app.
- Added phase 2 manual A3 editing: editors for the header, all seven sections and metrics, each save kept as a version with a summary of what changed, a version history page, read-only earlier versions and restore. Saves from an out-of-date page are refused.
- Added charts drawn from the saved version: run chart with the gap shaded, breakdown and Pareto bars, goal bullet chart, effect against effort matrix, Gantt chart, follow-up run chart, fishbone and 5 Whys, plus a KPI tile in Background. Rule warnings now show beside their section.
- Added metric import from CSV and Excel with column mapping and a preview. Added decision record 0003, which replaces SheetJS with ExcelJS.
- Added the phase 1 app: Next.js, PostgreSQL schema and migration, invite-link sign-in, the My A3s list and the empty A3 workspace with a coach placeholder.
- Added the system architecture with diagrams, decision record 0002 and the updated delivery plan.
- Added the repository guide, dataset validation, a synthetic example and the foundation CI workflow.
