# Article Hook — Fundamentals of Software Architecture

**Series:** Architecture in Practice
**Book source:** Fundamentals of Software Architecture — Richards, Ford (O'Reilly 2020)
**Target date:** 2026-05-25

## Working title

Every Rails App Has an Architecture. Mine Just Didn't Know It Yet.

## One-sentence argument

Synergym accumulated its architecture by default — reading Fundamentals of Software Architecture forced the first explicit trade-off decisions the codebase had ever had.

## Proof artifact

- `adr/ADR-001-architecture-style.md` — first documented architecture decision
- `code/architecture-characteristics-checklist.md` — 3 characteristics chosen, 5 explicitly deferred

## Outline

1. **The problem** — 874-LOC controllers, 730-LOC User model, zero documented decisions
2. **The concept** — architecture characteristics, trade-off analysis, what "least worst" actually means
3. **The application** — Synergym's implicit style identified, fitness profile scored, 3 ADRs written
4. **The result** — what became a decision vs. what stayed a trade-off
5. **The honest take** — what the book doesn't solve (it gives vocabulary, not answers)

## Opening hook (draft)

I had a 874-line controller. I didn't add it on purpose — it grew there, one action at a time, across months of features. I also had no architecture document, no decision log, and no way to explain to a client why the system was built the way it was.

That is what an architecture looks like when it accumulates rather than gets decided.

## What this article is NOT

- Not a tutorial on Rails best practices
- Not a comparison of microservices vs monolith in the abstract
- Not a book summary — the book takes 400 pages; this takes one real problem

## Status

- [ ] ADR-001 written
- [ ] ADR-002 written
- [ ] ADR-003 written
- [ ] Characteristics checklist complete
- [ ] Article written
- [ ] Published to ozzo.blog
