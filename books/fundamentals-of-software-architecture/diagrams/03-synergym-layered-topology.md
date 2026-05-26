# Synergym — Layered Architecture Topology (Current State)

**What this shows:** Synergym's actual architecture as a layered monolith, with the real coupling problems surfaced. This is the "before" picture the article is built around — not a made-up example, but the real system.

**Key insight:** The architecture style is correct for the current phase. The problem is not the *style* — it's the *discipline*. God Models and fat controllers are coupling debt that doesn't require a style migration to fix.

```mermaid
flowchart TD
    Browser["Browser / Mobile"]

    subgraph PRESENTATION["Presentation Layer"]
        CTRL["Controllers\n30 controllers — avg 233 LOC\nDashboardsController: 874 LOC ⚠️"]
        VIEWS["Views / ERB Templates"]
    end

    subgraph BUSINESS["Business Layer"]
        SVC["Service Objects\n10 services\nTranslationService: 561 LOC ⚠️"]
        JOBS["Background Jobs\n6 jobs via SolidQueue"]
    end

    subgraph DOMAIN["Domain / Model Layer"]
        USER["User Model\n730 LOC · 15+ associations ⚠️\nrole logic + unit conversion\n+ preferences all mixed in"]
        MODELS["Other Models\n16 models"]
    end

    subgraph PERSISTENCE["Persistence Layer"]
        DB[("PostgreSQL\nsingle instance")]
    end

    Browser --> CTRL
    CTRL --> SVC
    CTRL --> USER
    SVC --> USER
    SVC --> MODELS
    JOBS --> USER
    JOBS --> MODELS
    USER --> DB
    MODELS --> DB

    style PRESENTATION fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style BUSINESS fill:#ede9fe,stroke:#7c3aed,color:#3b0764
    style DOMAIN fill:#fef9c3,stroke:#ca8a04,color:#422006
    style PERSISTENCE fill:#dcfce7,stroke:#16a34a,color:#14532d
    style USER fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    style CTRL fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    style SVC fill:#ffedd5,stroke:#ea580c,color:#7c2d12
```

**Layer breakdown:**

| Layer | What lives here | Coupling debt |
|---|---|---|
| Presentation | 30 controllers, ERB views | `DashboardsController` at 874 LOC — computes streak, achievements, scheduling in one class |
| Business | 10 service objects, 6 background jobs | `TranslationService` at 561 LOC — mixes API calls, cache, locale lookup, fallback |
| Domain / Model | 17 ActiveRecord models | `User` at 730 LOC — role logic, unit conversion, preferences all in one model |
| Persistence | Single PostgreSQL instance | No read replica, no explicit availability decision |

**Red nodes = coupling debt accepted as known risk (documented in ADR-002).**
The architecture is not wrong — the coupling discipline is the fix.
