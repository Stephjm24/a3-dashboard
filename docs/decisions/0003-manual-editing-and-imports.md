# 0003 · Manual A3 editing, versions and spreadsheet imports

Status: proposed on 27 November 2026 with the phase 2 pull request, for the product owner's review. Amends the SheetJS choice in [0002](0002-system-architecture.md).

## Context

Phase 2 makes every A3 section editable by hand, keeps a version for every save and draws the charts from the saved version. Metric history can be typed or imported from CSV or Excel.

0002 named SheetJS for reading Excel files. Current SheetJS releases are published only on the SheetJS CDN. The `xlsx` package on npm is frozen at 0.18.5 and has unfixed security advisories. The CDN is not reachable from the build environment, and installing from a separate tarball host adds a supply-chain path that the lockfile and `npm audit` do not cover.

## Decision

| Topic | Decision |
| --- | --- |
| Editing | Each part of the A3 (header, seven sections, metrics) has its own editor. Saving one part validates it with the section's Zod schema, merges it into the current document and saves the whole document as the next version. |
| Concurrent saves | A save names the version it started from. If the A3 has moved on, the save is refused and the person is asked to reload, rather than silently overwriting another tab's work. |
| History | Every save is a version with an automatic summary of the parts that changed, such as "Edited Goal and Metrics". Any version can be opened read-only with its charts, and restored as a new version. Nothing is deleted. |
| Excel | [ExcelJS](https://github.com/exceljs/exceljs) 4.4.0 reads `.xlsx` on the server. CSV is parsed by the app's own small parser. Older `.xls` files are asked to be saved as `.xlsx`. |
| Uploaded files | The file is read in memory and discarded. Only the numbers the person maps to a metric and saves are kept, with "Imported from <file>" as the metric's source. Storing original files waits for Blob Storage in phase 6, so the `uploads` table stays unused. Limit 2 MB per file. |
| Charts | Apache ECharts, drawn in the browser as SVG from the version on screen. Fishbone and 5 Whys are custom SVG and HTML. Colours follow a colour-blind-checked palette; status colours only mean status. |

## Consequences

- ExcelJS depends on an older `uuid` package with a moderate advisory about a buffer argument that ExcelJS does not use when reading files. Review again when ExcelJS releases a new version.
- A crafted `.xlsx` can still use memory while it is unpacked. The 2 MB limit, sign-in requirement and invited testers keep this acceptable for the proof of concept. Revisit before real data in phase 6.
- The coach in phase 3 saves accepted drafts through the same versioned save, with source `ai_draft`.
