# Synergym — Layered Architecture Topology (Current State)

**What this shows:** Synergym's actual architecture as a layered monolith, with the real coupling problems surfaced. This is the "before" picture the article is built around — not a made-up example, but the real system.

**Key insight:** The architecture is correct for the current phase (solo developer, active feature development). The problem is not the *style* — it's the *discipline*. God Models and fat controllers are coupling debt that doesn't require changing the architecture style to fix.

```mermaid
flowchart TD
    Browser(["🌐 Browser / Mobile"])

    subgraph RAILS["Synergym — Rails 8 Layered Monolith"]
        subgraph PRESENTATION["Presentation Layer"]
            CTRL["Controllers\n30 controllers · avg 233 LOC\n⚠️ DashboardsController: 874 LOC"]
            VIEWS["Views\nERB Templates"]
        end

        subgraph BUSINESS["Business Layer"]
            SVC["Service Objects\n10 services\n⚠️ TranslationService: 561 LOC"]
            JOBS["Background Jobs\n6 jobs · SolidQueue"]
        end

        subgraph DOMAIN["Domain / Model Layer"]
            USER["User Model\n⚠️ 730 LOC\n⚠️ 15+ associations\n⚠️ role logic + unit conversion\n+ preference logic mixed in"]
            MODELS["Other Models\n16 models"]
        end

        subgraph PERSISTENCE["Persistence Layer"]
            DB[("PostgreSQL\nsingle instance\nno read replica")]
        end
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

    style PRESENTATION fill:#e3f2fd,stroke:#1565c0
    style BUSINESS fill:#f3e5f5,stroke:#6a1b9a
    style DOMAIN fill:#fff8e1,stroke:#f57f17
    style PERSISTENCE fill:#e8f5e9,stroke:#2e7d32
    style USER fill:#ffccbc,stroke:#d84315
    style CTRL fill:#ffccbc,stroke:#d84315
    style SVC fill:#ffe0b2,stroke:#ef6c00
```

**The ⚠️ markers are coupling debt, not architecture failures.** The layered style is the right choice. The discipline of keeping layers clean is the fix — not a style migration.

**Decisions made (from ADR-001, ADR-002):**
- Layered monolith accepted — correct for solo dev, active feature phase
- God Models accepted — with a documented extraction plan (UserPreferences value object)
- Single PostgreSQL accepted — vertical scaling is the ceiling, but we haven't hit it
