# ADR-001: Subdomain Classification for Synergym

**Date:** 2026-06-17
**Status:** accepted
**System:** Synergym (synergym_next)

## Context

Synergym is a fitness coaching SaaS where trainers build programs and assign them to athletes. Book 1 established the architecture style (layered monolith) and deferred explicit domain boundaries. DDD's first question is: what kind of work are we actually doing? The answer — core, supporting, or generic — determines how much design investment each area deserves and which implementation pattern to use.

The classification below is based on two tests from Khononov (ch. 1):
1. **Core test:** Would a competitor pay for this as a SaaS? If yes, it's core — our competitive advantage.
2. **Generic test:** Does a proven off-the-shelf solution exist? If yes, use it — don't build it.
Everything remaining that the business needs but doesn't differentiate on is supporting.

## Subdomain map

### Core subdomains

#### Coaching engagement lifecycle
The assignment of a fitness program to a specific athlete by a trainer, governed by a set of business rules: the athlete must be an active client of the trainer, the trainer must own the program, the athlete can have only one active program at a time, and expiry is calculated from the program's duration. The `ClientConnection` (invitation, acceptance, 14-day expiry) gates this entirely.

**Evidence of core:** Five invariants enforced at the model level in `ProgramAssignment`. The `only_one_active_program_per_athlete` constraint is not a generic scheduling rule — it is a business decision about what responsible coaching looks like. `ClientConnection`'s expiry logic (14-day window, multi-step reminder cadence) is also domain-specific.

**Files today:** `app/models/program_assignment.rb` (187 LOC, 5 validation methods), `app/models/client_connection.rb` (181 LOC), `app/jobs/program_assignment_expiration_job.rb`, `app/jobs/client_invitation_reminder_job.rb`

**Current pattern:** Active Record with heavy callbacks and validations — approximating a domain model without the explicit structure.

---

### Supporting subdomains

#### Exercise library
CRUD for exercises with variants, workout day structures, and AI-generated translations. Complex to maintain (multilingual, many associations) but not a differentiator — any fitness platform needs an exercise catalogue. The translation feature is interesting but it's infrastructure work, not domain logic.

**Files today:** `app/models/exercise.rb` (357 LOC), `app/models/exercise_variant.rb`, `app/models/workout_day.rb` (295 LOC), `app/models/workout_exercise.rb` (322 LOC), `app/jobs/translate_exercise_job.rb`

**Current pattern:** Active Record. Correct — stay here.

#### Program builder
Trainers create programs (sets of workout days with exercises). Moderate complexity in the data structure (workout days → workout exercises → exercises), but the business rules are thin: name required, duration must be positive, status must be draft/active/expired. No cross-aggregate invariants.

**Files today:** `app/models/program.rb` (95 LOC)

**Current pattern:** Active Record. Correct.

#### Athlete onboarding
The multi-step onboarding flow for both trainer and athlete roles: role selection, profile completion, preference setup. Domain-specific steps but not competitive logic.

**Files today:** `app/models/concerns/onboardable.rb`, onboarding controllers

**Current pattern:** Concern + controllers. Fine as-is.

#### Goal tracking
Athletes set fitness goals; programs can reference a goal. Currently a lookup table with system defaults. Simple.

**Files today:** `app/models/goal.rb` (21 LOC)

**Current pattern:** Active Record. Correct.

#### Blog / content
Marketing blog with trainer-authored posts. Standard CMS-level CRUD.

**Files today:** `app/models/blog_post.rb` (237 LOC — overbuilt for what it does)

**Current pattern:** Active Record. Could be a transaction script. The 237 LOC is a warning sign worth watching.

---

### Generic subdomains

#### Authentication and identity
Devise (database auth), Google OAuth (`OauthAuthenticatable`), email verification (`EmailVerifiable`), soft delete (`SoftDeletable`). Industry-standard solutions exist for all of this. Building it in-house provides zero advantage.

**Files today:** `app/models/user.rb` (336 LOC), `app/models/concerns/oauth_authenticatable.rb`, `app/models/concerns/email_verifiable.rb`, `app/models/concerns/soft_deletable.rb`

**Current pattern:** Active Record + Devise. Correct — Devise is the right tool here.

#### User preferences / unit system
The `UnitSystem` value object and the unit/locale columns on `users`. Every fitness app needs unit preferences. This was correctly extracted as a value object (book 1 outcome).

**Files today:** `app/value_objects/unit_system.rb`, preference columns on `users`

**Current pattern:** Value object + delegated predicates on User. Correct.

#### Background jobs infrastructure
Retry logic, monitoring, idempotency patterns. Not business logic — operational infrastructure. Already handled well (book 1 ADR-003 outcome).

**Files today:** `app/jobs/application_job.rb`, `JobMonitoring` concern

**Current pattern:** SolidQueue + concerns. Correct.

#### Email notifications
Mailers for invitations, reminders, expiry. The *triggers* (when to send) are business logic (in jobs). The *sending* is generic.

**Current pattern:** ActionMailer. Correct.

---

## Decision

**The coaching engagement lifecycle (ProgramAssignment + ClientConnection) is the one true core subdomain.** Everything else is either supporting (needs building, doesn't differentiate) or generic (buy/adopt).

This has two immediate consequences:

1. **Investment priority:** The coaching context deserves explicit aggregate design, clear invariants, and domain events. Not now — current complexity doesn't force it yet — but the next time a new business rule touches `ProgramAssignment`, it should land in a proper aggregate, not another Rails callback.

2. **Don't over-engineer the rest:** `Exercise`, `Program`, `BlogPost`, and `Goal` should stay as active records. No domain model. No events. Adding DDD patterns to a supporting subdomain is waste.

## Consequences

**Positive:**
- Clear map for where to spend design energy
- Supporting subdomains have explicit permission to stay simple
- Generic subdomains have explicit permission to stay off-the-shelf

**Negative / accepted trade-offs:**
- `ProgramAssignment` and `ClientConnection` will need a real refactor when the next core business rule arrives — the current active-record-with-validations approach won't scale
- The boundary between coaching and exercise library is implicit today (associations) — no enforcement mechanism yet

## Related

- Book: Learning Domain-Driven Design, Ch. 1 (Analyzing Business Domains), Ch. 2 (Discovering Domain Knowledge)
- ADR-002: Bounded context design (follows from this classification)
- ADR-003: Business logic pattern selection
- Code: `app/models/program_assignment.rb`, `app/models/client_connection.rb`
