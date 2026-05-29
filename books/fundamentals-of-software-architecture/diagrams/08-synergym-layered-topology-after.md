# Synergym — Five Modules Extracted from Two God Objects (PR #302)

**What this shows:** Which components lived inside each God Object before extraction, and the runtime relationships between them after. This is the before→after told at the component level, not the layer level — read diagram 03 for the layer view.

**Key insight:** Extraction did not change how the system works. It changed *where the logic lives*. `DashboardsController` still orchestrates the athlete dashboard — it now delegates to focused components instead of computing everything inline.

```mermaid
C4Component
    title Five Modules Extracted from Two God Objects — PR #302

    Container_Boundary(b_ts, "TranslationService  ·  1129 → 383 LOC ✓") {
        Component(ts, "TranslationService", "Service Object", "EN/IT routing and fallback — reduced to orchestration only")
        Component(ent, "ExerciseNameTranslator", "Service Object", "EN→IT curated override table + rule-based compound names")
        Component(swt, "SimpleWordTranslator", "Service Object", "Static word-level dictionaries (es↔en, it↔en)")
    }

    Container_Boundary(b_dash, "DashboardsController  ·  874 → 382 LOC ✓") {
        Component(dash, "DashboardsController", "Rails Controller", "HTTP layer only — no computation")
        Component(wct, "WorkoutCompletionTracker", "Service Object", "Session / cache lookup with log fallback for past dates")
        Component(sc, "StreakCalculator", "Service Object", "Consecutive-workout streak over 90-day window")
        Component(wsh, "WorkoutSchedulingHelper", "Helper Module", "Ordered upcoming workout days for dashboard display")
    }

    Container_Boundary(b_ex, "ExercisesController  ·  445 → 397 LOC ✓") {
        Component(ex, "ExercisesController", "Rails Controller", "HTTP layer only — no inline filter logic")
        Component(efb, "ExerciseFilterBuilder", "Service Object", "Builds ActiveRecord scope from q / category / muscle_group params")
    }

    Rel(ts, ent, "delegates EN→IT exercise name lookup")
    Rel(ts, swt, "delegates word-level dictionary lookup")
    Rel(dash, wct, "delegates completion state check")
    Rel(wct, sc, "provides completed dates for streak")
    Rel(dash, wsh, "delegates upcoming workout ordering")
    Rel(ex, efb, "delegates filter scope building")
```

**Extraction summary:**

| Extracted from | New component | Single responsibility |
|---|---|---|
| `TranslationService` | `ExerciseNameTranslator` | EN→IT exercise name: curated overrides + rule-based compound translation |
| `TranslationService` | `SimpleWordTranslator` | Static word dictionaries (es↔en, it↔en) + movement/prefix constants |
| `DashboardsController` | `WorkoutCompletionTracker` | Completion state: session → cache → log fallback chain |
| `DashboardsController` | `StreakCalculator` | Streak computation over 90-day lookback |
| `DashboardsController` → `WorkoutSchedulingHelper` | `ordered_upcoming_workout_days` | Upcoming workout ordering with completion filtering |
| `ExercisesController` | `ExerciseFilterBuilder` | ActiveRecord scope from HTTP filter params |

**What the CI gate now enforces (see diagram 06):** any future PR that touches these files and pushes them back over 400 LOC, introduces a method with cyclomatic complexity > 10, or adds a direct model query from a controller will fail CI before merge.
