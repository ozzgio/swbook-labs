# ADR-003: Business Logic Pattern Selection

**Date:** 2026-06-17
**Status:** accepted
**System:** Synergym (synergym_next)

## Context

ADR-001 classified subdomains. ADR-002 mapped bounded contexts. This ADR answers: which business logic pattern should each context use? Khononov (ch. 5-8) defines four patterns on a complexity spectrum:

| Pattern | Use when | State | Invariants |
|---------|----------|-------|-----------|
| Transaction script | Simple ETL, one operation = one transaction, no shared state | Stateless procedure | None |
| Active record | Data-centric CRUD with basic validation | Mutable AR object | Field-level only |
| Domain model | Aggregates, entities, value objects, domain events | Encapsulated state machine | Cross-object, enforced by aggregate root |
| Event-sourced domain model | Need audit trail, time travel, or event-driven projections | Append-only event log | Same as domain model |

The selection is driven by the complexity of the subdomain and its invariants — not by personal preference.

## Analysis per context

### Coaching Context — Domain Model

**Current state:** Active Record with heavy callbacks and validations. `ProgramAssignment` has five validation methods. `ClientConnection` enforces a 14-day expiry window with multi-step reminder cadence. Both models have a status machine (active/completed/paused/expired for ProgramAssignment; pending/active/rejected/expired for ClientConnection).

**Why Active Record is not enough here:** Active Record is designed for field-level validations (`validates :email, presence: true`). `ProgramAssignment`'s `only_one_active_program_per_athlete` is a cross-record invariant — it queries the database inside a validation to assert that no other ProgramAssignment for this athlete is active. This is an aggregate invariant, not a field rule. Rails callbacks make this work today, but:
- The invariant is unenforceable without an active DB connection (no unit-testable domain logic)
- Adding a new business rule means another callback — the model grows without structure
- The "one active program" rule is implicit knowledge in a `validates` block, not an explicit business concept

**Why not event sourcing:** No audit trail requirement today. No time-travel query. Event sourcing would add operational overhead (projections, event store) without current benefit.

**Decision: Domain Model — to be applied progressively.**

Not a full rewrite now. The pattern is: the next time a new business rule must be added to `ProgramAssignment` or `ClientConnection`, it goes into an explicit command method on the aggregate, not a new callback. This is the strangler fig approach applied at the method level.

**Planned aggregate structure (see spike in `code/src/`):**

```
ProgramAssignment (aggregate root)
  ├── value objects: DateRange, AthleteId, TrainerId, ProgramId
  ├── status: active | completed | paused | expired
  ├── commands: assign(athlete, trainer, program, dateRange)
  │             complete()
  │             pause()
  │             expire()
  └── domain events: ProgramAssigned, ProgramCompleted, ProgramExpired
```

The spike models this in TypeScript to learn the pattern without the Rails AR layer getting in the way. Applying it to Rails will follow.

---

### Library Context — Active Record

**Current state:** `Exercise` (357 LOC), `WorkoutDay` (295 LOC), `WorkoutExercise` (322 LOC), `Program` (95 LOC), `Goal` (21 LOC). All Active Record. No cross-record invariants. Complexity is in associations and data shape, not in business rules.

**Why Active Record is correct:** The Library context is a supporting subdomain. Its rules are: name required, duration positive, status transitions are simple (draft → active → expired for Program). No invariant crosses multiple aggregates. No complex state machine that can't be expressed as a `validates` or `before_update`.

The high LOC counts (`WorkoutExercise` at 322 LOC) are a code organization problem, not a domain model problem. They should be addressed by extraction (scopes into query objects, callbacks into service objects) — not by introducing aggregates.

**Active Record is the right ceiling here.** Adding DDD patterns to Library is waste.

---

### Identity Context — Active Record (Devise)

**Current state:** `User` (336 LOC) with concerns. Devise handles authentication. Value object (`UnitSystem`) handles unit conversion.

**Why Active Record is correct:** The Identity context is generic. The complexity (OAuth, email verification, soft delete) is handled by well-tested libraries (Devise, OmniAuth). The `User` model's job is to be a Devise model plus preference storage. No business invariants cross User records.

The `UnitSystem` value object already demonstrates DDD thinking at the right level — it's a value object, not an entity, and it's immutable. This is the correct granularity.

---

### Content Context — Transaction Script (via controller)

**Current state:** `BlogPost` (237 LOC). The business logic amounts to: a post has a title, body, and status. Published posts are visible. Draft posts are not. That's it.

**Why Transaction Script / Active Record at the floor:** `BlogPost` has no invariants that span multiple records. The 237 LOC is inflated by association callbacks and content processing (slug generation, reading time), not by real domain complexity. A thin controller + model is the right shape.

If the blog grows to require approval workflows, editorial calendars, or multi-author collaboration, that's when complexity would justify escalating to Active Record with proper validations. It's not there today.

---

## Summary table

| Context | Subdomain type | Current pattern | Target pattern | When to escalate |
|---------|---------------|-----------------|----------------|-----------------|
| Coaching | Core | Active Record (heavy) | Domain Model | Now (next new rule) |
| Library | Supporting | Active Record | Active Record | Only if invariants appear |
| Identity | Generic | Active Record + Devise | Same | Not on the roadmap |
| Content | Supporting | Active Record (bloated) | Simplify to thin AR | If editorial workflow added |

---

## Decision

**Domain Model for Coaching Context. Active Record for everything else.**

The spike in `code/src/` implements the Coaching aggregate in TypeScript. The Rails migration path is:

1. When the next Coaching rule is needed, add it as an explicit `command` method on `ProgramAssignment` instead of a callback
2. Extract domain events (`ProgramAssigned`, `ProgramExpired`) as plain Ruby value objects
3. Move invariant checking from `validates` into aggregate command methods
4. Keep the AR layer as a persistence mechanism — the aggregate doesn't need to inherit from `ApplicationRecord`; it can be a plain Ruby object that AR saves

This is incremental, reversible, and doesn't require a flag day.

## Consequences

**Positive:**
- Coaching gets an explicit model where business rules are readable, not hidden in callbacks
- Supporting contexts stay simple — no premature abstraction
- The TypeScript spike produces learning that translates directly to the Rails implementation

**Negative / accepted trade-offs:**
- Two styles of logic in the same codebase for a period (AR callbacks in existing code + command methods on refactored aggregates)
- Domain Model in Rails without a framework (no dry-rb, no ROM) requires discipline — the line between AR and the aggregate can blur if not enforced by review
- Event sourcing remains unavailable — if Synergym ever needs "show all state changes to an assignment over its lifetime", the event log needs to be built from scratch

## Related

- Book: Learning Domain-Driven Design, Ch. 5 (Transaction Script), Ch. 6 (Active Record), Ch. 7 (Domain Model), Ch. 8 (Event-Sourced Domain Model)
- ADR-001: Subdomain classification
- ADR-002: Bounded context design
- Spike: `code/src/` — aggregate pattern implemented in TypeScript
- Code: `app/models/program_assignment.rb`, `app/models/client_connection.rb`
