# ADR-002: Bounded Context Design

**Date:** 2026-06-17
**Status:** accepted
**System:** Synergym (synergym_next)

## Context

ADR-001 classified Synergym's subdomains. The next question: how many distinct models (bounded contexts) should the system maintain, and where do their boundaries sit? Khononov's rule (ch. 3): a bounded context is the boundary within which a model is consistent and the ubiquitous language is unambiguous. The same concept can mean different things across contexts — what matters is that it means exactly one thing inside each context.

Synergym is a Rails monolith. We are not decomposing into services. Bounded contexts here are **logical boundaries** — separate namespaces, directories, or concern groups — not separate deployments. The goal is to enforce that models in one context don't carry concepts that only make sense in another.

## Context map

Four bounded contexts:

```
┌─────────────────────────────────────────────┐
│  IDENTITY CONTEXT (generic)                  │
│  User, Devise, OAuth, EmailVerification      │
│  Language: user, credential, role            │
└──────────────┬──────────────────────────────┘
               │  downstream (conformist)
               ▼
┌─────────────────────────────────────────────┐
│  COACHING CONTEXT (core)                     │
│  ProgramAssignment, ClientConnection         │
│  Language: trainer, athlete, assignment,     │
│  connection, active, expired, paused         │
└──────┬──────────────┬───────────────────────┘
       │ ACL           │ downstream
       ▼               ▼
┌────────────┐  ┌─────────────────────────────┐
│  LIBRARY   │  │  CONTENT CONTEXT (supporting)│
│  CONTEXT   │  │  BlogPost                    │
│(supporting)│  │  Language: post, draft,      │
│  Exercise, │  │  published, author           │
│  Program,  │  └─────────────────────────────┘
│  Goal      │
│  Language: │
│  exercise, │
│  program,  │
│  workout   │
└────────────┘
```

### Identity Context (generic)

**Owns:** `User`, authentication (Devise), OAuth (`OauthAuthenticatable`), email verification (`EmailVerifiable`), soft delete (`SoftDeletable`), unit preferences (`UnitSystem`), onboarding (`Onboardable`).

**Language here:** *user*, *credential*, *role* (trainer/athlete), *onboarding step*, *unit preference*. The word "trainer" in this context means "a user with role = trainer" — nothing about coaching relationships.

**Relationship to other contexts:** upstream to all. All other contexts conform to its `User` record (they reference `user_id`, never define their own User concept).

**Today's location:** `app/models/user.rb`, `app/models/concerns/`, `app/value_objects/unit_system.rb`

---

### Coaching Context (core)

**Owns:** `ProgramAssignment`, `ClientConnection`.

**Language here:** *trainer*, *athlete*, *connection* (the formal trainer-athlete relationship), *assignment* (a specific program given to a specific athlete), *active*, *expired*, *paused*, *completed*. The word "athlete" here means "an athlete who has an active connection to this trainer" — not any user with role = athlete.

**This context's model of a trainer is NOT the Identity Context's User.** From Coaching's perspective, a trainer is identified by their `trainer_id` (which happens to be a `users.id` FK) and is responsible for accepting or refusing connections and for assigning programs. That's all. The name, email, and OAuth tokens belong to Identity — Coaching doesn't care.

**Relationship to Identity Context:** conformist in code (references `user_id` FK directly — no anticorruption layer today). If Coaching's concept of "trainer" ever diverges from Identity's `User` shape, an ACL will be needed.

**Relationship to Library Context:** downstream with ACL. `ProgramAssignment` references `program_id`. But a `Program` in Library context (a catalogue item with workout days) is NOT the same concept as an assigned program in Coaching context. Today the FK makes them the same object — the distinction is conceptual. If the coaching logic needs to know program duration to compute assignment end dates, it should read that from Library through a thin adapter, not by joining into Library's full object graph.

**Today's location:** `app/models/program_assignment.rb`, `app/models/client_connection.rb`, `app/jobs/program_assignment_expiration_job.rb`, `app/jobs/client_invitation_reminder_job.rb`

**Aggregate roots in this context:**
- `ProgramAssignment` — aggregate root, owns its own status machine and invariants
- `ClientConnection` — aggregate root, owns invitation/acceptance/expiry lifecycle

---

### Library Context (supporting)

**Owns:** `Exercise`, `ExerciseVariant`, `WorkoutDay`, `WorkoutExercise`, `Program`, `Goal`.

**Language here:** *exercise*, *variant*, *workout day*, *program* (a template of exercises, not an assignment), *goal*. "Program" in this context means "a catalogue item a trainer builds" — it has workout days, exercises, a duration. It does not know about athletes.

**Relationship to Identity Context:** conformist (references `user_id` for trainer ownership of programs).

**Relationship to Coaching Context:** upstream. Coaching pulls program information from Library to compute assignment attributes. This is the only cross-context data flow that matters for business logic.

**Today's location:** `app/models/exercise.rb`, `app/models/exercise_variant.rb`, `app/models/workout_day.rb`, `app/models/workout_exercise.rb`, `app/models/program.rb`, `app/models/goal.rb`

---

### Content Context (supporting)

**Owns:** `BlogPost`.

**Language here:** *post*, *draft*, *published*, *author*. Entirely decoupled from Coaching and Library — a blog post has an author (`user_id`) but no relation to coaching activity.

**Today's location:** `app/models/blog_post.rb`

---

## Integration patterns

| Integration | Pattern | Rationale |
|-------------|---------|-----------|
| Identity → Coaching | Conformist | Coaching uses `user_id` FK directly. Risk: Coaching becomes coupled to `users` table shape. Acceptable while User model is stable. |
| Identity → Library | Conformist | Same as above — `programs.trainer_id` is a `user_id`. |
| Library → Coaching | FK today; ACL when needed | `program_assignments.program_id` is a Library FK. Today this is a conformist relationship. If assignment logic needs to diverge from the program's Library representation, introduce an adapter. |
| Identity → Content | Conformist | `blog_posts.author_id = user_id`. No business logic crosses this boundary. |

No partnership patterns needed today — Coaching is the only context that has real coupling risk, and it's manageable with current monolith constraints.

---

## Decision

**Four logical contexts; boundaries enforced by convention today, not by code.**

Specifically:
1. `ProgramAssignment` and `ClientConnection` are designated as Coaching Context. No other model should enforce Coaching invariants.
2. `Exercise`, `Program`, `Goal` are Library. They should not contain coaching logic (e.g., no "is this program assigned to any athlete" query inside `Program`).
3. Cross-context data access happens via association today (monolith), but should be thought of as cross-context calls — not as shared state.
4. The next Coaching invariant or command that appears in a Rails callback should instead be placed in a dedicated service or command object inside the Coaching context boundary.

**What this does NOT decide:** whether to introduce directory namespaces (`app/models/coaching/`, `app/models/library/`), Ruby module namespacing, or Rails engines. That's a future concern when the distinction needs enforcement beyond convention.

## Consequences

**Positive:**
- Engineers know where to put new Coaching rules (ProgramAssignment/ClientConnection, not in User or Program)
- Library can evolve independently — new exercise types don't touch Coaching
- Content is explicitly isolated — blog doesn't pollute the domain model

**Negative / accepted trade-offs:**
- Boundaries are implicit today — no `rubocop` rule or namespace guard prevents cross-boundary calls
- The Library → Coaching FK coupling is a latent risk: if Library's `Program` model is deleted or restructured, Coaching breaks silently at runtime

## Related

- Book: Learning Domain-Driven Design, Ch. 3 (Managing Complexity with Bounded Contexts), Ch. 4 (Integrating Bounded Contexts)
- ADR-001: Subdomain classification (identifies core vs. supporting)
- ADR-003: Business logic pattern selection per context
- Code: `app/models/program_assignment.rb`, `app/models/client_connection.rb`, `app/models/program.rb`

---

## Amendment — 2026-06-17: Namespacing question closed

**Question this closes:** the original decision explicitly deferred whether to introduce directory/module namespacing (`app/models/coaching/`, `app/models/library/`, Ruby modules, or Rails engines) to enforce these boundaries in code.

**Decision: no namespacing. Enforced by an architecture spec instead.** `spec/architecture/bounded_context_spec.rb` reads each context's model source and fails the suite if Library or Content files hardcode a Coaching status literal or reference a model outside their context.

**Rationale:**
- Module namespacing (e.g. `Coaching::ProgramAssignment`) would require renaming every reference across controllers, views, routes, mailers, jobs, serializers, and the spec/factory files for two classes — for a boundary that today has exactly two real crossing points (`Program#update_status_based_on_assignments!` reading Coaching's status, `ProgramAssignment#program_duration_weeks` reading Library's `duration_weeks`). The rename's blast radius is disproportionate to the enforcement gained.
- The architecture spec gives the same regression protection — a boundary violation fails CI — without the rename. It already caught a real violation during this session: `Program` was hardcoding `ProgramAssignment`'s `status: "active"` literal directly; fixed by routing through `ProgramAssignment.active` instead, so Coaching alone owns the meaning of "active."
- Rails engines are out of scope — Synergym is a monolith by design (Book 1, ADR-001 in `fundamentals-of-software-architecture`), and engines solve a deployment-boundary problem this system doesn't have.

**Revisit when:** Coaching needs to be extracted into its own deployable service, or a third real cross-context coupling point appears beyond the two known today. At that point the cost of namespacing is paid once anyway, as part of the extraction.

**Code:** `spec/architecture/bounded_context_spec.rb`, `app/models/program.rb`, `app/models/program_assignment.rb`
