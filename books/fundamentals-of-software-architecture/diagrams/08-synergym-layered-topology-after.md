# Synergym — Layered Architecture Topology (After PR #302)

**What this shows:** Synergym's architecture after the five-module extraction — the same layered monolith, now with coupling debt paid down. Read this alongside diagram 03 (the before state): the style didn't change, the discipline did.

**Key insight:** No architecture migration needed. Five targeted extractions brought both God Objects inside the 400 LOC fitness function, removed the mixed-responsibility violations, and put an automated gate in CI to prevent regression. The remaining red node (`User`, 730 LOC) is accepted debt with a documented extraction plan — not a gap, a decision.

```mermaid
flowchart TD
    Browser["Browser / Mobile"]

    subgraph CI["CI Gate — Fitness Functions Enforced (ADR-0007)"]
        direction LR
        FF1["LOC < 400"]
        FF2["Complexity < 10"]
        FF3["No layer skips"]
    end

    subgraph PRESENTATION["Presentation Layer"]
        DASH["DashboardsController\n874 → 382 LOC ✓"]
        EX["ExercisesController\n445 → 397 LOC ✓"]
        VIEWS["Views / ERB"]
    end

    subgraph BUSINESS["Business Layer — extracted (PR #302)"]
        subgraph TS_GROUP["TranslationService 1129 → 383 LOC ✓"]
            TS["TranslationService\n383 LOC"]
            ENT["ExerciseNameTranslator\n96 LOC"]
            SWT["SimpleWordTranslator\n48 LOC"]
        end
        subgraph DASH_GROUP["DashboardsController extractions"]
            WCT["WorkoutCompletionTracker"]
            SC["StreakCalculator"]
            WSH["WorkoutSchedulingHelper"]
        end
        EFB["ExerciseFilterBuilder"]
        JOBS["Background Jobs"]
    end

    subgraph DOMAIN["Domain / Model Layer"]
        USER["User Model\n730 LOC\n⚠ accepted debt — ADR-002"]
        MODELS["Other Models"]
    end

    subgraph PERSISTENCE["Persistence Layer"]
        DB[("PostgreSQL")]
    end

    Browser --> DASH & EX
    DASH & EX --> VIEWS
    DASH --> WCT --> SC
    DASH --> WSH
    EX --> EFB
    TS --> ENT & SWT
    JOBS --> MODELS
    MODELS --> DB
    USER --> DB

    DASH -.->|"documented debt\nADR-002"| USER
    CI -.->|"blocks regressions\non every PR"| PRESENTATION
    CI -.->|"blocks regressions\non every PR"| BUSINESS

    linkStyle 0,1,2,3,4,5,6,7,8,9 stroke:#0066ff,stroke-width:2px
    linkStyle 10 stroke:#f59e0b,stroke-width:2px,stroke-dasharray:5 5
    linkStyle 11,12 stroke:#16a34a,stroke-width:2px,stroke-dasharray:4 4

    style CI fill:#dcfce7,stroke:#16a34a,color:#14532d
    style FF1 fill:#bbf7d0,stroke:#16a34a,color:#14532d
    style FF2 fill:#bbf7d0,stroke:#16a34a,color:#14532d
    style FF3 fill:#bbf7d0,stroke:#16a34a,color:#14532d
    style PRESENTATION fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style BUSINESS fill:#ede9fe,stroke:#7c3aed,color:#3b0764
    style TS_GROUP fill:#f5f3ff,stroke:#7c3aed,color:#3b0764
    style DASH_GROUP fill:#f5f3ff,stroke:#7c3aed,color:#3b0764
    style DOMAIN fill:#fef9c3,stroke:#ca8a04,color:#422006
    style PERSISTENCE fill:#dcfce7,stroke:#16a34a,color:#14532d
    style DASH fill:#bbf7d0,stroke:#16a34a,color:#14532d
    style EX fill:#bbf7d0,stroke:#16a34a,color:#14532d
    style TS fill:#bbf7d0,stroke:#16a34a,color:#14532d
    style ENT fill:#ede9fe,stroke:#7c3aed,color:#3b0764
    style SWT fill:#ede9fe,stroke:#7c3aed,color:#3b0764
    style WCT fill:#ede9fe,stroke:#7c3aed,color:#3b0764
    style SC fill:#ede9fe,stroke:#7c3aed,color:#3b0764
    style WSH fill:#ede9fe,stroke:#7c3aed,color:#3b0764
    style EFB fill:#ede9fe,stroke:#7c3aed,color:#3b0764
    style USER fill:#fef3c7,stroke:#f59e0b,color:#78350f
    style JOBS fill:#ede9fe,stroke:#7c3aed,color:#3b0764
    style MODELS fill:#fef9c3,stroke:#ca8a04,color:#422006
    style DB fill:#dcfce7,stroke:#16a34a,color:#14532d
```

**What changed (before → after):**

| Component | Before | After | How |
|---|---|---|---|
| `DashboardsController` | 874 LOC 🔴 — computes streak, scheduling, completions inline | 382 LOC ✓ | Extracted `WorkoutCompletionTracker`, `StreakCalculator`, `WorkoutSchedulingHelper` |
| `TranslationService` | 1129 LOC 🔴 — API calls, cache, locale lookup, fallback mixed | 383 LOC ✓ | Extracted `ExerciseNameTranslator`, `SimpleWordTranslator` |
| `ExercisesController` | 445 LOC 🟡 | 397 LOC ✓ | Extracted `ExerciseFilterBuilder` |
| Layer skip violations | 3 red arrows (CTRL→User, SVC→User, Jobs→User) | 1 ⚠ documented (User, ADR-002) | Scope filtering + service delegation |
| Architectural governance | None — violations discovered at code review | CI fitness functions — blocked at commit | ADR-0007 + 3 automated gates |

**What did NOT change:**

- Architecture style: still layered monolith (correct — ADR-001)
- `User` model: still 730 LOC (accepted — ADR-002, extraction plan documented)
- Deployment: single NUC, single PostgreSQL (correct — ADR-001 trade-off)
- Chosen characteristics: Agility, Simplicity, Learnability — all preserved

**Blue arrows = normal layered flow. Yellow dashed = accepted debt. Green dashed = CI gate enforcement.**
