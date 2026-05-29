# Synergym — Layered Architecture Topology (After PR #302)

**What this shows:** The same layered monolith after the five-module extraction. Read alongside diagram 03 (before state): the style is unchanged, the coupling discipline is not.

**Key insight:** No architecture migration needed. Two targeted extractions brought `DashboardsController` (874 → 382 LOC) and `TranslationService` (1129 → 383 LOC) inside the fitness function. An automated CI gate now prevents regression. Eight pre-existing files over 400 LOC remain — they are grandfathered debt (ADR-0005), not new violations.

```mermaid
flowchart TD
    %% ── CI gate ─────────────────────────────────────────────────────────────
    CI["🔒 CI Fitness Functions — ADR-0007\nLOC < 400  ·  Complexity < 10  ·  No layer skips\nEnforced on every PR — pre-existing debt grandfathered"]

    %% ── Presentation layer ──────────────────────────────────────────────────
    subgraph PRESENTATION["Presentation Layer"]
        DASH["DashboardsController\n874 → 382 LOC ✓"]
        EX["ExercisesController\n445 → 397 LOC ✓"]
        VIEWS["Views / ERB"]
    end

    %% ── Business layer ──────────────────────────────────────────────────────
    subgraph BUSINESS["Business Layer — five modules extracted (PR #302)"]
        TS["TranslationService\n1129 → 383 LOC ✓"]
        ENT["ExerciseNameTranslator  96 LOC"]
        SWT["SimpleWordTranslator  48 LOC"]
        WCT["WorkoutCompletionTracker"]
        SC["StreakCalculator"]
        WSH["WorkoutSchedulingHelper"]
        EFB["ExerciseFilterBuilder"]
        JOBS["Background Jobs"]
    end

    %% ── Domain layer ────────────────────────────────────────────────────────
    subgraph DOMAIN["Domain / Model Layer — 8 files over 400 LOC (ADR-0005)"]
        USER["user.rb  699 LOC\nAccepted debt — ADR-002"]
        DEBT["+ 7 others over 400 LOC\nprogram_assignments_controller  639\napplication_helper  539\nprogram_importer  522\n..."]
        MODELS["Other Models"]
    end

    %% ── Persistence ────────────────────────────────────────────────────────
    DB[("PostgreSQL")]

    %% ── Connections ────────────────────────────────────────────────────────
    CI -.->|"blocks regressions"| PRESENTATION
    CI -.->|"blocks regressions"| BUSINESS
    DASH --> VIEWS
    EX --> VIEWS
    DASH --> WCT
    WCT --> SC
    DASH --> WSH
    EX --> EFB
    TS --> ENT
    TS --> SWT
    DASH --> MODELS
    EX --> MODELS
    JOBS --> MODELS
    MODELS --> DB
    USER --> DB
    DASH -.->|"documented debt — ADR-002"| USER

    %% ── Styles ─────────────────────────────────────────────────────────────
    classDef green fill:#bbf7d0,stroke:#16a34a,color:#14532d
    classDef violet fill:#ede9fe,stroke:#7c3aed,color:#3b0764
    classDef amber fill:#fef3c7,stroke:#f59e0b,color:#78350f
    classDef debt fill:#fee2e2,stroke:#dc2626,color:#7f1d1d

    class DASH,EX,TS green
    class ENT,SWT,WCT,SC,WSH,EFB,JOBS violet
    class USER,DEBT amber

    style CI fill:#dcfce7,stroke:#16a34a,color:#14532d
    style PRESENTATION fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style BUSINESS fill:#f5f3ff,stroke:#7c3aed,color:#3b0764
    style DOMAIN fill:#fefce8,stroke:#ca8a04,color:#422006
    style DB fill:#dcfce7,stroke:#16a34a,color:#14532d
    style MODELS fill:#fef9c3,stroke:#ca8a04,color:#422006
    style VIEWS fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
```

**What changed (before → after):**

| Component | Before | After | How |
|---|---|---|---|
| `DashboardsController` | 874 LOC — streak, scheduling, completions inline | 382 LOC ✓ | Extracted `WorkoutCompletionTracker`, `StreakCalculator`, `WorkoutSchedulingHelper` |
| `TranslationService` | 1129 LOC — API calls, cache, fallback mixed | 383 LOC ✓ | Extracted `ExerciseNameTranslator`, `SimpleWordTranslator` |
| `ExercisesController` | 445 LOC | 397 LOC ✓ | Extracted `ExerciseFilterBuilder` |
| Architectural governance | None | CI gate on every PR | 3 automated checks — ADR-0007 |

**Pre-existing debt not addressed (ADR-0005 — grandfathered, not blocked by CI):**

| File | LOC | Notes |
|---|---|---|
| `user.rb` | 699 | Accepted — extraction plan in ADR-002 |
| `trainer/program_assignments_controller.rb` | 639 | Undocumented debt |
| `application_helper.rb` | 539 | Undocumented debt |
| `program_importer.rb` | 522 | Undocumented debt |
| `workout_exercises_controller.rb` | 436 | Undocumented debt |
| `production_monitoring.rb` | 420 | Undocumented debt |
| `wger_exercise_importer.rb` | 419 | Undocumented debt |
| `athlete/workout_days_controller.rb` | 410 | Undocumented debt |

The CI gate prevents new violations from entering. It does not retroactively force fixes on pre-existing debt — that is ADR-0005's explicit decision.
