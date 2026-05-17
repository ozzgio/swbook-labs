# ADR-001: Layered Monolith as the Chosen Architecture Style

**Date:** 2026-05-17
**Status:** accepted
**System:** Synergym (synergym_next)

## Context

Synergym is a Rails 8 fitness coaching platform with two primary roles (trainer, athlete), an admin surface, and a growing exercise library. The codebase has accumulated ~17 models, ~30 controllers, ~7000 LOC in controllers, and 10 service objects over multiple development phases. No architecture style was ever explicitly chosen.

The question is not "should we refactor?" — it is: is the current style the right one for the current phase, and what would trigger a change?

Current implicit style: **layered monolith** (Rails MVC + service objects, single PostgreSQL, single Puma process).

Evaluated alternatives:
- Service-based architecture (split by domain: trainer, athlete, admin, exercise-library)
- Modular monolith (explicit bounded contexts within the same deploy)
- Microservices (independent deployable services per domain)

## Decision drivers

- Team size: solo developer (Giorgio)
- Deployment: single NUC, no orchestration infrastructure
- Revenue stage: pre-scale, active feature development
- Primary constraint: agility and simplicity over scalability
- Operational cost: near-zero tolerance for infrastructure complexity

## Options considered

### Option A: Stay layered monolith (current)

Fitness profile (from Richards & Ford, ch. 9):
- Simplicity: ★★★★★ — one deploy, one DB, one codebase
- Agility: ★★★★☆ — Rails conventions accelerate change
- Testability: ★★★☆☆ — framework helps; fat controllers hurt
- Deployability: ★★★☆☆ — no zero-downtime story yet
- Scalability: ★★☆☆☆ — vertical only, DB is the ceiling
- Modularity: ★★☆☆☆ — declining as God Models grow

**Pros:** No new infrastructure, no distributed systems complexity, no cross-service coordination. Every change is local.
**Cons:** Coupling grows with LOC. Testability degrades without active discipline. No clear extraction path when scale demands it.

### Option B: Modular monolith

Same deploy, but explicit module boundaries: `TrainerContext`, `AthleteContext`, `ExerciseLibraryContext`, `AdminContext`. Shared database, enforced internal APIs.

**Pros:** Prepares for eventual service extraction. Forces explicit bounded contexts now. No infrastructure change.
**Cons:** Significant refactor of shared User model and cross-context controllers. No business value shipped during refactor.

### Option C: Service-based architecture

Extract trainer and athlete as separate services sharing the same database.

**Pros:** Independent deployability per domain. Clear ownership boundaries.
**Cons:** Shared DB negates most distributed systems benefits. Network calls replace in-process calls. Operational complexity exceeds current team capacity.

## Decision

**Chosen: Option A — layered monolith, with explicit discipline rules.**

Rationale: Synergym is in active feature development. The primary architectural risk is not scale — it is coupling. Coupling is addressable within the monolith without a style migration. A modular monolith (Option B) is the correct next step when coupling cost exceeds agility benefit, but that threshold has not been reached.

**The trigger for revisiting this decision:**
- A single controller exceeds 1000 LOC with no extraction plan
- A domain change requires touching more than 3 unrelated models
- Test suite feedback loop exceeds 5 minutes
- A second developer joins the project

## Consequences

**Positive:**
- All feature work continues at current velocity
- No infrastructure investment required
- Rails conventions remain the primary productivity tool

**Negative / accepted trade-offs:**
- Scalability ceiling remains at vertical scaling of a single PostgreSQL instance
- Coupling discipline must be enforced manually (no architectural enforcement)
- God Models (User 730 LOC, DashboardsController 874 LOC) are accepted debt with a documented extraction plan

## Related

- Book: Fundamentals of Software Architecture, Ch. 9 (Architecture Styles), Ch. 2 (Trade-off Analysis)
- ADR-002: User model coupling decision
- Code: `app/models/user.rb`, `app/controllers/dashboards_controller.rb`
