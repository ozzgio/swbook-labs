# Fundamentals of Software Architecture — Richards, Ford

**Problem:** Synergym had no documented architecture decisions. 874-line controllers, 730-line User model, zero trade-off records. The codebase had an architecture — it just never chose one.

**Decision:** Layered monolith is the right style for the current phase. Three characteristics chosen explicitly (agility, simplicity, learnability), five deferred. Trade-offs documented before they became invisible.

## Artifacts

| Type | File | What it decides |
|------|------|----------------|
| ADR | [adr/ADR-001-architecture-style.md](adr/ADR-001-architecture-style.md) | Why layered monolith, not service-based or microservices |
| ADR | [adr/ADR-002-user-model-coupling.md](adr/ADR-002-user-model-coupling.md) | Accepting God Model now, UserPreferences extraction roadmap |
| ADR | [adr/ADR-003-job-reliability.md](adr/ADR-003-job-reliability.md) | At-most-once delivery accepted for current job volume |
| Checklist | [code/architecture-characteristics-checklist.md](code/architecture-characteristics-checklist.md) | 3 characteristics chosen, 5 explicitly deferred |
| Spike | [code/src/](code/src/) | UserPreferences value object — before/after TypeScript |

## Diagrams

Mermaid diagrams covering architecture styles quadrant, connascence hierarchy, Synergym layered topology (before/after), fitness functions, and trade-off canvas. See [diagrams/](diagrams/).

## Running the spike

```bash
cd code
npm install
npm test
```

## Article

[Every Rails App Has an Architecture. Mine Just Didn't Know It Yet.](https://ozzo.blog/articles/rails-architecture-accumulated-by-default) — ozzo.blog, Architecture in Practice series
