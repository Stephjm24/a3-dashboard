# System architecture

Version 0.1, agreed with the product owner on 27 November 2026. The full design, with the reasoning behind each choice, is in [A3 Coach App: System Architecture v0.1](https://claude.ai/artifact/XSZj8WzCkwsijUGeY7SbPL). The decisions are recorded in [0002 · System architecture for the proof of concept](decisions/0002-system-architecture.md).

A person describes a problem in plain language. A guided AI coach turns it into a problem-solving A3 on a live dashboard. The coach proposes text and numbers, and the person accepts or edits every one before it becomes part of the A3.

The diagrams describe the agreed target. The [README](../README.md) lists what runs today and the [delivery plan](delivery.md) assigns each remaining capability to a phase.

## 1. System context

The browser talks only to the app server. The server is the only part that talks to the database, file storage, sign-in and Claude. Moving to Azure changes the services on the right, not the app.

```mermaid
flowchart LR
    person([Person writing an A3])

    subgraph browser[Browser]
        chat[Coach chat<br/>left pane]
        dash[Live A3 dashboard<br/>right pane]
    end

    subgraph server["App server · Next.js in Docker"]
        coach[Coach workflow<br/>section order, questions, rubric]
        a3[A3 data and versions<br/>Zod schema checks]
        uploads[Upload reader<br/>CSV and Excel]
        pdf[PDF export<br/>headless browser]
        ai[AI connector]
        kb[(A3 knowledge base<br/>questions, rubric, mistakes)]
    end

    subgraph services[Outside services]
        auth[Sign-in<br/>email invite now, Entra ID later]
        db[(PostgreSQL<br/>A3 versions, drafts, chat)]
        files[(File storage<br/>uploads)]
        claude[Claude Opus 5.5<br/>Anthropic API now<br/>Microsoft Foundry later]
    end

    person --> chat
    person --> dash
    browser <-->|HTTPS| server
    kb --> coach
    coach --> ai
    coach --> a3
    uploads --> a3
    a3 --> db
    uploads --> files
    pdf --> dash
    ai --> claude
    server --> auth
```

## 2. One coach turn

Each chat message runs one guided step. The app's code picks the section and the question; Claude only writes within that step and must answer in a fixed JSON shape. Nothing reaches the A3 until the person accepts it.

```mermaid
sequenceDiagram
    actor P as Person
    participant UI as Browser
    participant S as App server
    participant DB as PostgreSQL
    participant C as Claude (via AI connector)

    P->>UI: Types an answer
    UI->>S: Send message
    S->>DB: Load current A3, section state, recent chat
    S->>C: Fixed prompt (cached knowledge base) + A3 JSON + section + chat
    C-->>S: JSON: reply, proposed field updates, next question, flags
    S->>S: Validate against the A3 schema<br/>Reject numbers with no source quote
    S->>DB: Save chat turn and pending drafts
    S-->>UI: Stream reply, show drafts in A3 boxes
    P->>UI: Accept, edit or reject each draft
    UI->>S: Decision
    S->>DB: Save a new A3 version
    S-->>UI: Charts redraw from the new version
```

## 3. Coaching flow across the A3

The coach moves through the sections in A3 order. Each section has a soft gate: it is marked done once its core questions are answered, but the person can move on or go back at any time.

```mermaid
flowchart TD
    intake[Intake: background and current state<br/>in the person's own words] --> synth[Synthesize: draft Background<br/>and Current condition, list gaps]
    synth --> bg[Background]
    bg --> cc[Current condition]
    cc --> goal[Goal]
    goal --> rca[Root cause analysis]
    rca --> cm[Countermeasures]
    cm --> plan[Implementation plan]
    plan --> fu[Follow-up]
    fu --> rev[Whole-A3 review<br/>read in reverse]

    subgraph each[Inside each section]
        core[Core questions] --> probe[Probe questions<br/>where answers are thin]
        probe --> challenge[Challenge questions<br/>when a common mistake is spotted]
        challenge --> rubric[Section rubric check]
    end
```

## 4. Environments and delivery

GitHub runs application and foundation checks on pull requests and pushes to `main`. The diagram shows the intended deployment flow for the tester and Azure phases. Local and tester environments use test data.

```mermaid
flowchart LR
    dev[Claude Code<br/>works on a branch] --> pr[Pull request]
    pr --> ci[GitHub Actions<br/>checks and tests]
    ci --> review[Product owner<br/>reviews and merges]
    review --> main[(main)]

    main --> local
    main --> test
    main -.->|after approval| azure

    subgraph local[Local]
        l1[Laptop or Codespaces<br/>Postgres in Docker<br/>Anthropic API dev key<br/>test data only]
    end
    subgraph test[Test]
        t1[Render<br/>same Docker container<br/>managed Postgres<br/>test data only]
    end
    subgraph azure[Azure]
        a1[Azure Container Apps<br/>Azure Database for PostgreSQL<br/>Blob Storage, Key Vault<br/>Entra ID sign-in<br/>Claude on Microsoft Foundry]
    end
```

## 5. Stored data

Each A3 is stored as a whole JSON document per version, following the A3 data model. The tables around it hold users, drafts, chat, uploads and reviews.

```mermaid
erDiagram
    users ||--o{ a3s : owns
    a3s ||--o{ a3_versions : "saved as"
    a3s ||--o{ drafts : "has pending"
    a3s ||--o{ coaching_turns : "has chat"
    a3s ||--o{ raw_inputs : "keeps own words"
    a3s ||--o{ uploads : "has files"
    a3_versions ||--o{ reviews : "scored by"

    users {
        uuid id
        text email
        text name
        text sign_in_provider
    }
    a3s {
        uuid id
        uuid owner_id
        text type
        text title
        text status
        text pdca_stage
        int current_version
    }
    a3_versions {
        uuid a3_id
        int version
        jsonb document
        uuid saved_by
        text change_summary
        text source
    }
    drafts {
        uuid id
        uuid a3_id
        text field_path
        jsonb proposed_value
        text source_quote
        text state
    }
    coaching_turns {
        uuid id
        uuid a3_id
        text section
        text question_id
        text tag
        text speaker
        text body
    }
    raw_inputs {
        uuid id
        uuid a3_id
        text section
        text body
    }
    uploads {
        uuid id
        uuid a3_id
        text file_name
        text storage_key
        jsonb parsed_columns
        text mapped_metric_id
    }
    reviews {
        uuid id
        uuid a3_id
        int version
        jsonb scores
        jsonb flags
    }
```

## Target technology stack

| Layer | Choice |
| --- | --- |
| App framework | Next.js with TypeScript |
| Look and components | Tailwind CSS with shadcn/ui |
| Database access | Prisma with PostgreSQL |
| Validation | Zod, one schema for the A3 data model |
| Sign-in | One-time invite links with server-side sessions now; Microsoft Entra ID added in phase 6 |
| AI | Anthropic TypeScript SDK, with its Foundry client later |
| Charts | Apache ECharts, plus custom SVG for fishbone and 5 Whys |
| Spreadsheets | ExcelJS on the server, see [0003](decisions/0003-manual-editing-and-imports.md) |
| PDF | Playwright printing the A3 page |
| Tests | Vitest, Playwright, and a set of sample problems for the coach |
