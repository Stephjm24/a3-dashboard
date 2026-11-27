# 0002 · System architecture for the proof of concept

Status: adopted on 27 November 2026 by the product owner. Supersedes the open product and hosting questions in [0001](0001-repository-boundaries.md).

## Context

0001 expected an existing application export to be imported. There is none: the app is built new in this repository from the agreed system design. The A3 content (section definitions, coaching questions, rubric, common mistakes and data model) comes from the A3 Thinking Knowledge Base kept in the project files.

The organisation's standard platform is Microsoft Azure, but no Azure subscription or Microsoft Foundry approval exists yet. The plan is to build first and seek approval with a working app.

## Decision

| Topic | Decision |
| --- | --- |
| Users | Product owner and a few testers, each with their own login. Each person sees only their own A3s. Mentor sharing later. |
| Scope | The full problem-solving A3, all seven sections. Follow-up results entered by hand. Other A3 types and approvals later. |
| Platform | Desktop web app, readable on a phone, one-page PDF export. |
| Builder | Claude Code writes the code on branches; the product owner reviews and merges every pull request. |
| AI coach | A guided workflow run by the app's code, not a free agent. Claude Opus 5.5 returns structured JSON for each step. |
| Final say | The AI proposes; the person accepts, edits or rejects. No invented numbers: every proposed number must trace to the person's words or an uploaded cell. |
| Screen | Coach chat on the left, live A3 on the right, suggestions shown as drafts in the A3 boxes. To be reviewed once built. |
| Numbers | Typed in chat or fields, plus CSV or Excel upload for metric history. |
| Stack | One TypeScript app on Next.js, Prisma and PostgreSQL, Zod, Apache ECharts, SheetJS, Playwright. |
| Storage | PostgreSQL. Each A3 version saved whole as JSON. |
| Sign-in | One-time invite links created by the product owner, with server-side sessions. Microsoft Entra ID is added in phase 6. Auth.js was the first choice, but its current major version is still a beta, so the library for Entra ID is chosen in phase 6. |
| AI provider | One AI connector module. Anthropic API with a development key and test data now; Claude on Microsoft Foundry after Azure approval, as a settings change. |
| Hosting | GitHub for code, reviews and Actions. Render for the tester phase with test data only. Azure Container Apps after approval. GitHub Pages is not used because the app needs a server. |
| Repository | The product owner's GitHub account owns it for now. |

## Alternatives considered

- **Azure OpenAI instead of Claude on Foundry.** Workable if IT has already approved it; not chosen because Claude fits the coaching style and runs on Foundry inside the same Azure subscription.
- **A free-roaming AI agent.** Rejected: the coach must stay on A3 thinking and be predictable and testable.
- **A .NET API with a separate React front end.** Kept as the fallback if IT requires .NET on Azure.
- **Static hosting on GitHub Pages.** Rejected: the AI key and database need a server.

## Consequences

- The Python foundation checks and their workflow stay. The app adds its own build, lint, type and test jobs.
- Until Azure is approved, no real company-confidential or patient data goes into Local or Test.
- To keep the move to Foundry a settings change, the app does not use the Claude features Foundry on Azure lacks: the Files API, code execution, server-side fallbacks, Message Batches and mid-conversation system messages.
- If real patient or GxP data is ever planned, IT and quality review it first.

See [architecture.md](../architecture.md) for the diagrams.
