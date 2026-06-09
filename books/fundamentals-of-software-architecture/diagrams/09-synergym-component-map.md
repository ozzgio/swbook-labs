# Diagram 09 — Synergym Component Map (Current State)

Source: Ch. 8 — Component-Based Thinking

Shows the current technical partitioning of Synergym and the implicit domain
bleeding that results from the entity trap in User.rb.

## Technical layers (current partitioning)

```mermaid
graph TD
  subgraph HTTP["Controllers (HTTP layer)"]
    DC[DashboardsController<br/>874 LOC]
    UC[UsersController]
    WC[WorkoutsController]
    EC[ExercisesController]
  end

  subgraph Models["Models (persistence + business rules)"]
    UM[User.rb<br/>730 LOC<br/>⚠ entity trap]
    WM[Workout.rb]
    EM[Exercise.rb]
  end

  subgraph Services["Services"]
    TS[TranslationService<br/>561 LOC<br/>⚠ 3 responsibilities]
    IS[InvitationService]
  end

  subgraph Jobs["Jobs (async)"]
    TJ[TranslateExerciseJob]
    IJ[InvitationReminderJob]
  end

  DC --> UM
  DC --> WM
  UC --> UM
  WC --> WM
  EC --> EM
  EM --> TS
  TJ --> TS
  UM --> IS
  IJ --> IS
```

## Implicit domains (not yet partitioned)

```mermaid
graph LR
  subgraph Athlete["Athlete domain"]
    A1[Dashboard logic]
    A2[Progress tracking]
    A3[Streak / achievements]
  end

  subgraph Trainer["Trainer domain"]
    T1[Client management]
    T2[Workout assignment]
    T3[Schedule management]
  end

  subgraph ExLib["Exercise Library domain"]
    E1[Exercise catalogue]
    E2[Translation]
    E3[Media]
  end

  subgraph Auth["Auth / Shared"]
    S1[User.rb<br/>⚠ knows all domains]
    S2[Roles]
    S3[Sessions]
  end

  S1 --> A1
  S1 --> A2
  S1 --> A3
  S1 --> T1
  S1 --> T2
  S1 --> E1
```

## Partitioning decision

Synergym uses **technical partitioning** (Rails MVC default).
This is correct for the current phase and team size (solo).

The entity trap in `User.rb` is the primary structural debt.
It is not fixed now. It is documented here as the refactor target
once the implicit domains above are explicitly named (DDD Lab 2).
