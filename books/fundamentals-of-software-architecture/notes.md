# Fundamentals of Software Architecture

**Authors:** Mark Richards, Neal Ford
**Publisher:** O'Reilly, 2020
**Status:** in progress
**Started:** 2026-05-17

## Why this book

Starting point for everything else in this series. Before writing ADRs, before deciding whether to extract a service, before measuring coupling — there needs to be a shared vocabulary and a decision framework. This book is that foundation.

## Core thesis

Architecture is not a role, it is a set of decisions made under constraints. Every system already has an architecture — the question is whether it was chosen deliberately or accumulated by default. Good architects make trade-offs explicit before committing; bad ones discover them after the fact.

## Core concepts mapped to Synergym

---

### Architecture Characteristics (Ch. 4–5)

**What the book says:**
Every system has architecture characteristics — also called quality attributes or non-functional requirements. They are not features; they are the properties the system must exhibit: availability, reliability, testability, agility, fault tolerance, scalability, elasticity, deployability, learnability. No system can optimize for all of them simultaneously. The architect's job is to identify the ones that actually matter given the business context and design toward them.

**Where it shows up in Synergym:**
`config/` — Rails 8 defaults favor convention over explicit characteristic selection.
`app/jobs/` — 6 jobs exist but no documented reliability or fault-tolerance strategy.
`db/schema.rb` — All data in one PostgreSQL instance: no explicit availability decision.
`docker-compose.nuc-preview.yml` — Single-node deployment. No redundancy.

**The implicit characteristics Synergym currently optimizes for:**
- Learnability (Rails conventions reduce ramp-up)
- Agility (monolith = easy to change one thing)
- Simplicity (one deploy, one database, few moving parts)

**The characteristics it does NOT have but will need:**
- Deployability: no zero-downtime deploy strategy documented
- Testability: controller tests missing for 3 of the 5 heaviest controllers
- Reliability: no explicit retry/failure strategy for jobs (TranslateExerciseJob, invitation reminders)

**Decision needed:**
Explicitly state which 3 characteristics Synergym is designed for. Everything else is a trade-off, not a gap.

---

### Modularity — Coupling and Cohesion (Ch. 3)

**What the book says:**
Coupling measures how dependent modules are on each other. Cohesion measures how related the responsibilities within a module are. The goal is low coupling between modules and high cohesion within them. Connascence is the more precise framework: static connascence (name, type, position) is acceptable; dynamic connascence (execution order, timing, value) is dangerous at scale.

**Where it shows up in Synergym:**

High coupling — `app/models/user.rb` (730 LOC):
- Connascence of meaning: role logic (`trainer?`, `athlete?`, `admin?`) duplicated across controllers, policies, and views
- Connascence of algorithm: weight/distance unit conversion methods baked into User instead of a value object
- 15+ `has_many`/`has_one` — User is aware of every domain concept

Low cohesion — `app/controllers/dashboards_controller.rb` (874 LOC):
- Computes weekly completion, streak, achievements, scheduling suggestions
- All calculations specific to athlete dashboard but mixed with HTTP response logic
- No shared interface with the athlete domain — tight temporal coupling to the request cycle

`app/services/translation_service.rb` (561 LOC):
- Mixes: external API calls, cache management, locale lookup, fallback logic
- No single responsibility — three different jobs in one class

**Decision needed:**
Pick one coupling violation to fix as the lab artifact. Candidate: extract User's unit conversion + preference logic into `UserPreferences` value object.

---

### Architecture Styles (Ch. 9–15)

**What the book says:**
Richards and Ford catalog 8 architecture styles: layered, pipeline, microkernel, service-based, event-driven, space-based, orchestration-driven service-oriented, and microservices. Each has a characteristic fitness profile across 8 dimensions (deployability, elasticity, evolutionary, fault tolerance, modularity, overall cost, performance, reliability, scalability, simplicity, testability).

**Where it shows up in Synergym:**
Synergym is a **layered monolith** — the dominant Rails architecture style.

Fitness profile for Synergym's current style:
| Characteristic | Layered monolith rating | Synergym reality |
|---|---|---|
| Simplicity | ★★★★★ | Confirmed — single deploy, single DB |
| Agility | ★★★★☆ | High in early stages, declining as LOC grows |
| Testability | ★★★☆☆ | Medium — framework helps, but fat controllers hurt |
| Deployability | ★★★☆☆ | Medium — Puma, no blue/green, no canary |
| Scalability | ★★☆☆☆ | Low — vertical only, DB is single bottleneck |
| Fault tolerance | ★★☆☆☆ | Low — one process crash = full outage |
| Modularity | ★★☆☆☆ | Low — God models, fat controllers, shared DB |
| Evolutionary | ★★☆☆☆ | Medium — Rails helps, but coupling raises change cost |

**Decision needed:**
Is Synergym in the right style for its current phase? Yes — with explicit acknowledgment that modularity and testability are the constraints to address before any style migration.

---

### Trade-off Analysis (Ch. 2)

**What the book says:**
"Never shoot for the best architecture, but rather the least worst architecture." Every architectural decision trades one set of characteristics for another. The architect's job is to make that trade-off explicit, not to find the perfect answer.

**Where it shows up in Synergym:**
No documented trade-offs exist. The architecture accumulated rather than was decided.

**Decision needed:**
Write one trade-off record per the three biggest current decisions. This becomes ADR-001, ADR-002, ADR-003.

---

## Artifact

**Type:** Architecture decision checklist + Trade-off canvas + 3 ADRs

**Files:**
- `adr/ADR-001-architecture-style.md` — Why layered monolith (not service-based or microservices)
- `adr/ADR-002-user-model-coupling.md` — Accepting God Model now, plan for UserPreferences extraction
- `adr/ADR-003-job-reliability.md` — Accepting at-most-once delivery for current job volume
- `code/architecture-characteristics-checklist.md` — 3 chosen characteristics + explicit trade-offs

## Article hook

See `article-hook.md`
