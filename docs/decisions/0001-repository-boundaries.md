# 0001 · Keep the application portable until its source is available

Historical foundation decision. [Decision 0002](0002-system-architecture.md) supersedes the original application-import and hosting assumptions. The [current repository map](../../README.md#find-your-way-around) shows where the implementation lives.

## Evidence and scope

The supplied A3 project brief establishes a web dashboard under development, a GitHub source of truth, and a need to add information later. The project material available at initialisation contained the brief alone. The maintainer selected the private repository `Stephjm24/a3-dashboard`.

The existing UI, audience, permissions, workflows, library choices, routes, canonical fields, data providers, hosting and build commands still need evidence from the working export or an existing deployment. Do not infer any of these from the name A3. Record the source revision or export date and what actually runs when importing it.

## Layout at initialisation

```text
.
├── README.md                          Getting started and current project status
├── CONTRIBUTING.md                    Review, releases and recovery
├── CHANGELOG.md                       Unreleased and tagged changes
├── .editorconfig                      Formatting defaults for editors
├── .gitattributes                     Text and binary handling
├── .gitignore                         Local secrets, exports and build products
├── .github/workflows/foundation.yml    Pull request and main checks
├── data/schemas/
│   └── example-labels.v1.schema.json   Example portable JSON contract
├── tests/
│   ├── fixtures/example-labels.v1/
│   │   └── basic.json                  Fictional valid input for the example
│   └── test_foundation.py              Validator and hygiene regression tests
├── scripts/
│   ├── check.py                        Same checks locally and in CI
│   └── requirements.txt                Pinned validator dependencies
└── docs/
    ├── data.md                         Ownership, validation and population
    ├── delivery.md                     Milestones, hosting and promotion
    └── decisions/
        └── 0001-repository-boundaries.md
```

## Original application import proposal

Default to a single application. Preserve its existing entry point, relative asset paths, routing, package manager and lockfile. Import at the repository root if its conventions permit. If it requires its own root configuration that collides with existing files, inspect both versions before any replacement. A self-contained `app/` import is an alternative when it keeps a working export intact. Set the build root accordingly. Preserve a single-file dashboard as a single file on its first import.

| When evidence warrants it | Location and responsibility |
| --- | --- |
| Existing route or page | Use the framework's native route directory. Keep route entry points thin where the existing framework permits. |
| New dashboard module | Put its view, chart mappings, interactions and tests together under the application's existing feature convention. |
| Reused visual elements | Extract components, layouts, theme styles and design tokens into the app's shared UI area after a second use establishes the interface. |
| External integration | Give the app one data-access module per confirmed source. Keep fetching, normalisation and validation there. Share hooks or utilities when multiple modules need them. |
| Assets | Use the framework's asset or public directory. Preserve relative paths on import. Review every file shipped to the browser for audience suitability. |
| Types and configuration | Derive types from the canonical contract where the stack supports it. Add an environment example containing names and empty values only when the app actually reads settings. |
| First static dataset | Add `data/reference/<contract>.vN/<name>.json` when the owner approves a dataset. |
| First persistent backend | Put migrations alongside that service using its native migration tool. Store backup data externally. |
| Hosting integration | Version the selected host's build/routing configuration beside the real application. Keep secrets in the hosting environment. |

Use lower-kebab-case for new data and documentation filenames. Follow the imported codebase's conventions for components, hooks and routes. Give later architectural choices a numbered decision record with context, decision, alternatives and consequences.
