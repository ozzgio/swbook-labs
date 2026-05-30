# Diagram 08 — Synergym Layered Topology: After Extraction (PR #302)

Five modules pulled out of three God Objects.
Each source class now delegates to the components extracted from it.

```mermaid
graph TB
    classDef before fill:#f8d7da,stroke:#dc3545,color:#111
    classDef after  fill:#d4edda,stroke:#28a745,color:#111

    TS["TranslationService<br/>1129 → 383 LOC"]:::before
    ENT["ExerciseNameTranslator<br/>new"]:::after
    SWT["SimpleWordTranslator<br/>new"]:::after

    DC["DashboardsController<br/>874 → 382 LOC"]:::before
    SC["StreakCalculator<br/>new"]:::after
    WCT["WorkoutCompletionTracker<br/>new"]:::after
    WSH["WorkoutSchedulingHelper<br/>new"]:::after

    EC["ExercisesController<br/>445 → 397 LOC"]:::before
    EFB["ExerciseFilterBuilder<br/>new"]:::after

    TS -->|delegates to| ENT
    TS -->|delegates to| SWT

    DC -->|delegates to| SC
    DC -->|delegates to| WCT
    DC -->|delegates to| WSH

    EC -->|delegates to| EFB
```

| Extracted from | New component | Single responsibility |
|---|---|---|
| `TranslationService` | `ExerciseNameTranslator` | EN→IT exercise names: curated overrides + rule-based compound translation |
| `TranslationService` | `SimpleWordTranslator` | Static word dictionaries (es↔en, it↔en) + movement/prefix constants |
| `DashboardsController` | `WorkoutCompletionTracker` | Completion state: session → cache → log fallback chain |
| `DashboardsController` | `StreakCalculator` | Streak computation over 90-day lookback |
| `DashboardsController` | `WorkoutSchedulingHelper` | Upcoming workout ordering with completion filtering |
| `ExercisesController` | `ExerciseFilterBuilder` | ActiveRecord scope from HTTP filter params |
