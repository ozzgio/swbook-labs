# Synergym — Layered Architecture Topology (Current State)

**What this shows:** Synergym's actual architecture as a layered monolith, with the real coupling problems surfaced. This is the "before" picture the article is built around — not a made-up example, but the real system.

**Key insight:** The architecture style is correct for the current phase. The problem is not the *style* — it's the *discipline*. God Models and fat controllers are coupling debt that doesn't require a style migration to fix.

```mermaid
flowchart TD
    Browser["Browser / Mobile"]

    subgraph PRESENTATION["Presentation Layer"]
        CTRL["Controllers"]
        VIEWS["Views / ERB"]
    end

    subgraph BUSINESS["Business Layer"]
        SVC["Service Objects"]
        JOBS["Background Jobs"]
    end

    subgraph DOMAIN["Domain / Model Layer"]
        USER["User Model"]
        MODELS["Other Models"]
    end

    subgraph PERSISTENCE["Persistence Layer"]
        DB[("PostgreSQL")]
    end

    Browser --> CTRL
    CTRL --> VIEWS
    CTRL --> SVC
    SVC --> MODELS
    JOBS --> MODELS
    USER --> DB
    MODELS --> DB

    CTRL -.->|"layer skip"| USER
    SVC -.->|"God Model"| USER
    JOBS -.->|"layer skip"| USER

    linkStyle 0,1,2,3,4,5,6 stroke:#0066ff,stroke-width:2px
    linkStyle 7,8,9 stroke:#dc2626,stroke-width:2px,stroke-dasharray:5 5

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
| Presentation | 30 controllers (avg 233 LOC), ERB views | `DashboardsController` at 874 LOC — computes streak, achievements, scheduling in one class |
| Business | 10 service objects, 6 background jobs | `TranslationService` at 1129 LOC — mixes API calls, cache, locale lookup, fallback |
| Domain / Model | 17 ActiveRecord models | `User` at 730 LOC — role logic, unit conversion, preferences all in one model |
| Persistence | Single PostgreSQL instance | No read replica, no explicit availability decision |

**Blue arrows = normal layered flow. Red dashed arrows = layer skips (coupling violations).**
The architecture is not wrong — the coupling discipline is the fix.
