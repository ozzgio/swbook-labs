# Fundamentals of Software Architecture — Richards, Ford

Synergym had no documented architecture decisions. 874-line controllers, 730-line User model, zero trade-off records. The codebase had an architecture. It just never chose one.

Reading this book forced the first explicit decisions. Layered monolith stays for this phase. Three characteristics chosen (agility, simplicity, learnability), five explicitly deferred. Trade-offs written down before they became invisible.

## Artifacts

| Type | File | What it decides |
|------|------|----------------|
| ADR | [adr/ADR-001-architecture-style.md](adr/ADR-001-architecture-style.md) | Why layered monolith, not service-based or microservices |
| ADR | [adr/ADR-002-user-model-coupling.md](adr/ADR-002-user-model-coupling.md) | Accepting the God Model now, with a roadmap for UserPreferences extraction |
| ADR | [adr/ADR-003-job-reliability.md](adr/ADR-003-job-reliability.md) | At-most-once delivery accepted for the current job volume |
| Checklist | [code/architecture-characteristics-checklist.md](code/architecture-characteristics-checklist.md) | 3 characteristics chosen, 5 deferred |
| Spike | [code/src/](code/src/) | UserPreferences value object, before and after |

## Diagrams

Mermaid diagrams covering the architecture styles quadrant, connascence hierarchy, Synergym layered topology before and after, fitness functions, and trade-off canvas. See [diagrams/](diagrams/).

## Running the spike

```bash
cd code
npm install
npm test
```

## Article

[Every Rails App Has an Architecture. Mine Just Didn't Know It Yet.](https://ozzo.blog/articles/rails-architecture-accumulated-by-default) on ozzo.blog, Architecture in Practice series.
