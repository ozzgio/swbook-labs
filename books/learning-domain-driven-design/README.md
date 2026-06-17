# Learning Domain-Driven Design — Vlad Khononov

**Author:** Vlad Khononov
**Status:** in progress
**Started:** 2026-06-17
**Finished:** —

## Why this book

Book 1 named the architecture style (layered monolith) and documented three trade-offs. What it couldn't answer: *where* the boundaries inside that monolith should be. `ProgramAssignment` already enforces five business invariants in its validations. `ClientConnection` has a lifecycle with four statuses and expiry logic. These models are acting like aggregates without knowing it. DDD gives the vocabulary to name what's already happening and the tools to strengthen it before complexity makes refactoring expensive.

## Core thesis

Business subdomains — not technical layers — should drive decomposition. A company's core subdomain (what it does differently from competitors) deserves the most design investment: domain model, aggregates, explicit invariants. Supporting subdomains get active record or transaction scripts. Generic subdomains get off-the-shelf solutions. Bounded contexts keep models consistent by giving each subdomain its own language. The result: design that is hard to corrupt accidentally.

## Key concepts mapped to Synergym

### Subdomain classification

**What the book says:** Core subdomains provide competitive advantage and are complex, volatile, and must be built in-house. Supporting subdomains have simple logic (mostly CRUD). Generic subdomains are complex but shared across all companies — buy or adopt.

**Where it shows up:** `ProgramAssignment` enforces five invariants (`only_one_active_program_per_athlete`, `athlete_is_active_client`, `program_belongs_to_trainer`, `athlete_must_be_athlete_role`, `end_date_after_start_date`). That complexity signals a core subdomain. `Exercise` with AI translation is supporting. Devise + OAuth is generic.

**Decision made:** See `adr/ADR-001-subdomain-analysis.md`.

---

### Aggregate pattern

**What the book says:** An aggregate is a cluster of entities and value objects that protects its own consistency. All state changes go through the aggregate root. One aggregate per transaction. Size it by what must be strongly consistent.

**Where it shows up:** `ProgramAssignment` is already a de-facto aggregate — its `only_one_active_program_per_athlete` validation crosses records and belongs in the aggregate's command, not a Rails callback. The pattern formalizes what the model is already trying to be.

**Decision made:** See `adr/ADR-002-bounded-context-design.md`.

---

### Business logic pattern selection

**What the book says:** Match the pattern to the subdomain's complexity. Transaction script for ETL-level logic. Active record for simple data with basic rules. Domain model when invariants, entities, and state machines create genuine complexity. Event-sourced domain model when audit trail or time travel matters.

**Where it shows up:** Synergym has at least two distinct complexity tiers. `ProgramAssignment` / `ClientConnection` need a domain model. `Exercise`, `Program`, `BlogPost` are fine as active records.

**Decision made:** See `adr/ADR-003-business-logic-patterns.md`.

---

## Artifacts

| Type | File | What it decides |
|------|------|----------------|
| ADR | [adr/ADR-001-subdomain-analysis.md](adr/ADR-001-subdomain-analysis.md) | Core / supporting / generic classification for Synergym |
| ADR | [adr/ADR-002-bounded-context-design.md](adr/ADR-002-bounded-context-design.md) | Context boundaries inside the monolith |
| ADR | [adr/ADR-003-business-logic-patterns.md](adr/ADR-003-business-logic-patterns.md) | Which pattern per context and why |
| Spike | [code/src/](code/src/) | Aggregate pattern: `ProgramAssignment` with value objects and domain events |

## Running the spike

```bash
cd code
npm install
npm test
```

## Article

_Not yet published._
