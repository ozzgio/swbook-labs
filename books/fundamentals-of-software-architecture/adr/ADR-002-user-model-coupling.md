# ADR-002: Accept User God Model Now, Extract UserPreferences Later

**Date:** 2026-05-17
**Status:** superseded by outcome — see below
**System:** Synergym (synergym_next)

## Context

`app/models/user.rb` is 730 LOC and carries at least five distinct responsibilities:

1. **Authentication** — Devise modules, OAuth (Google OmniAuth), password management
2. **Role management** — `trainer?`, `athlete?`, `admin?` predicates; role-based query scopes
3. **Unit conversions** — weight, distance, rest time unit preference + conversion methods
4. **Localization preferences** — `preferred_locale`, `date_format`, `time_format`, `week_start_day`
5. **Fitness preferences** — `workouts_per_day`, default program settings
6. **Relationship hub** — 15+ `has_many`/`has_one` associations spanning every domain

This violates single responsibility. The cost: every new domain that needs to know about a user creates a new association or method in this file.

Connascence analysis (Richards & Ford, Ch. 3):
- Connascence of meaning: role checks (`user.trainer?`) duplicated across 16 Pundit policies, multiple controllers, and view helpers
- Connascence of algorithm: unit conversion logic (kg→lb, km→mi) lives in User instead of a dedicated value object, making it untestable in isolation
- Connascence of identity: associations like `has_many :workout_logs`, `has_many :program_assignments`, `has_many :client_connections` make User aware of all downstream models

## Decision drivers

- Current coupling cost is high but manageable (1 developer, full context)
- Extraction requires schema migration + significant controller updates
- No current bug is caused by this coupling — it is a maintainability risk, not a defect
- The correct extraction target (`UserPreferences`) is identifiable without ambiguity

## Options considered

### Option A: Extract now — create UserPreferences model

Create `UserPreferences` as a `has_one` model holding: `weight_unit`, `distance_unit`, `rest_time_unit`, `date_format`, `time_format`, `week_start_day`, `workouts_per_day`, `preferred_locale`.

Move conversion methods to a `UnitConverter` value object.

**Pros:** Reduces User to ~400 LOC. Conversion logic becomes testable in isolation. Clear separation of identity vs. preference.
**Cons:** Migration on live table. All references to `user.weight_unit` become `user.preferences.weight_unit` — ripple across 20+ views/controllers. No feature shipped during this work.

### Option B: Accept now, extract at next natural boundary

Keep User as-is. Document the coupling. Extract when a feature naturally requires it (e.g., preference import/export, multi-profile support, settings API).

**Pros:** Zero migration risk. Feature velocity preserved. Extraction happens with business justification.
**Cons:** Coupling grows if new preferences are added before extraction.

## Decision

**Chosen: Option B — accept the coupling, document the extraction plan.**

Rationale: The cost of extraction is real and immediate. The benefit is future maintainability, not current functionality. At solo-developer scale with full context, the coupling cost is manageable. The extraction will be triggered by one of: (a) adding a preferences import/export feature, (b) a second developer needing to understand User without a guide, or (c) the settings test suite becoming painful to maintain.

**Extraction plan (when triggered):**

1. Create `user_preferences` table with all preference columns
2. Migrate data via `UserPreferences.create!(user: u, **u.attributes.slice(*PREF_KEYS))` for all users
3. Add `has_one :preferences, class_name: 'UserPreferences'` to User
4. Create `UnitConverter` service object with class methods
5. Add delegation in User: `delegate :weight_unit, :distance_unit, ... to: :preferences`
6. Remove preference columns from `users` table

## Consequences

**Positive:**
- No disruption to current development
- Extraction path is documented and can be executed incrementally

**Negative / accepted trade-offs:**
- `user.rb` remains oversized — new developers need orientation
- Unit conversion bugs require touching User, not an isolated class
- Adding a new preference column means a `users` table migration

## Related

- Book: Fundamentals of Software Architecture, Ch. 3 (Modularity, Coupling, Connascence)
- ADR-001: Architecture style decision
- Code: `app/models/user.rb:1-730`, `app/policies/`, `app/helpers/application_helper.rb`

---

## Outcome (2026-06-17)

**What actually shipped — different approach, better result.**

The `UserPreferences` table extraction planned above did not happen. Instead, `user.rb` went from 730 → 336 LOC via two orthogonal techniques:

**1. Concerns-based behavior extraction.** Five concerns were extracted and included:
- `OauthAuthenticatable` — OAuth login, Google OmniAuth logic
- `ClientConnectable` — trainer/athlete connection predicates
- `Onboardable` — onboarding state machine and step logic
- `SoftDeletable` — paranoia-style soft-delete behavior
- `EmailVerifiable` — email verification flow

**2. `UnitSystem` value object.** Unit conversion logic and unit validation constants moved to `app/value_objects/unit_system.rb`. User delegates unit predicate methods to an on-the-fly `UnitSystem` instance. This is a tighter outcome than the planned `UnitConverter` service object — it's a proper immutable value object.

**What did NOT happen:** The preference columns (`weight_unit`, `distance_unit`, `preferred_locale`, `workouts_per_day`, etc.) remain on the `users` table. `UserPreferences` as a separate model was never created. The `delegate :weight_unit ... to: :preferences` migration path from the plan above is still valid if the trigger conditions are met.

**Trigger conditions remain in force:** `user.rb` is at 336 LOC and not under pressure. The original triggers (settings import/export feature, second developer, painful test suite) have not been hit.
