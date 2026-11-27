# Data and population

## Application data

Each A3 has an owner and a current version in PostgreSQL. Creating an A3 writes its header and first JSON document in a transaction. The application loads a version for its owner and validates the document with Zod before rendering the sheet.

| Question | Source of truth |
| --- | --- |
| What fields make up an A3 document? | [A3 document schema](../src/lib/a3/schema.ts) |
| Which sections does the workspace display? | [Section definitions](../src/lib/a3/sections.ts) |
| How are versions created and read? | [A3 repository functions](../src/lib/a3/repository.ts) |
| How are records, sessions and invites stored? | [Prisma schema](../prisma/schema.prisma) and [migrations](../prisma/migrations) |

Keep operational records in the database. Use synthetic data for local development and tester sessions. CSV and Excel import is planned for phase 2.

## Reference data in Git

The fictional labels list exercises the static reference validator. Each future reference dataset needs a consumer, an agreed definition and a source owner.

| Category and status | Authoritative location and format | Validation and proposed ownership |
| --- | --- | --- |
| Static reference contracts · implemented | `data/schemas/<dataset>.vN.schema.json`, JSON Schema Draft 2020-12 | Engineering maintainer checks the schema. The information owner signs off field meanings before a real dataset is introduced. |
| Synthetic development samples · implemented | `tests/fixtures/<dataset>.vN/<case>.json` | Same schema as the consumer. Developer owns coverage. Create fictitious records from scratch. |
| Small, approved, rarely changed reference lists · supported once supplied | One canonical reviewed JSON file or a documented set of disjoint files under `data/reference/<dataset>.vN/` | Information owner confirms source, reuse rights, meanings and refresh cadence. CI checks each file. |
| Tabular deliveries · conditional | Incoming CSV in an approved external landing area. A versioned importer can map headers and types to the JSON contract. | Source owner documents encoding, keys, dates, units, nulls and rejected rows. Engineering owns repeatable conversion. |
| Repository and deployment settings · implemented as needed | YAML for CI. Non-secret settings can be versioned. Secret values belong in an environment secret store. | Maintainer reviews configuration changes and environment boundaries. |

## Validate a dataset

The contract stem is the binding. For example, `example-labels.v1.schema.json` governs `tests/fixtures/example-labels.v1/basic.json`. CI checks every Git-visible file under the schema, fixture and reference roots. Each contract requires a passing synthetic fixture. The validator checks the schema itself, rejects malformed JSON, duplicate JSON keys and non-standard numeric literals, and evaluates records without fetching schemas over the network. Keep shared fragments within the contract using local `$defs` and fragment references. To support new cross-file references, add an explicit local schema registry and regression tests first.

Use one canonical field name, type and meaning for each concept. Register key uniqueness, missing-value semantics, ordering, units and any relationship checks in the dataset description. Use semantic checks when JSON Schema cannot express a rule, such as uniqueness of an identifier across files. Record breaking renames, required-field additions and changed units in a new major contract version. Keep the previous version until every consumer has migrated. A change to values with the same meaning goes through an ordinary reviewed commit.

## Adding a data source

1. Record the dataset name, purpose, upstream source and revision, owner, permitted audience, rights, update cadence, contract version and intended consumer in this document or a linked dataset page. Record the reason for choosing static delivery or service-backed delivery.
2. Start with a synthetic fixture. Include missing/empty cases where allowed and a regression test for one meaningful invalid case. Confirm field meanings with the owner before importing any records.
3. For reference data, use one reproducible transformation, stable ordering and a reviewable diff. Check row counts, identifiers and units against the source. Record the upstream revision in the PR. Keep intermediate exports outside Git. Document deduplication rules before combining sources.
4. For live data, authenticate at the server, enforce access for each request, map upstream names to the contract and validate before returning data to the UI. Define timeout/error handling and what the user sees when the source is unavailable.
5. Have the view consume a data-access function with the same result shape in development and production. Select the fixture provider in development/tests and the approved provider explicitly in production. A failed live request should produce the agreed error state. Keep fixtures out of production builds.
6. Submit code, schema, fixture, provenance and changelog impact together. Review a preview with synthetic data. Publish only approved reference data. For repeat imports, use stable source identifiers and an idempotent import, then reconcile counts before promotion.

Do not paste raw records into issues, PRs, CI logs or screenshots. Validation reports identify the file and failed constraint without echoing record values. Git history retains earlier versions of tracked content.
