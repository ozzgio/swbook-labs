# swbook-labs

Software architecture books applied to real systems. Each book produces one shipping-ready artifact and one article hook.

## Rules

- 1 book = 1 artifact (code spike, diagram, or decision)
- No pure theory — every concept must map to a real problem in Synergym or a client project
- Each lab closes with: what changed in the stack, metrics before/after, article hook ready
- Spike code: TypeScript across all books — consistent stack, patterns mapped to other stacks in notes

## Books — first 5

Selection rationale and full 28-book catalogue with scores: [`docs/adr/ADR-001-book-selection.md`](docs/adr/ADR-001-book-selection.md)

| # | Book | Status | Artifact | Article |
|---|------|--------|----------|---------|
| 1 | [Fundamentals of Software Architecture](books/fundamentals-of-software-architecture/) | in progress | Architecture decision checklist + 3 ADRs | — |
| 2 | Learning Domain-Driven Design | queued | Bounded context map for Synergym + DDD glossary | — |
| 3 | [Software Architecture: The Hard Parts](books/software-architecture-the-hard-parts/) | queued | 3 trade-off ADRs (consistency, coupling, deployability) | — |
| 4 | Building Evolutionary Architectures | queued | Fitness function suite for Synergym | — |
| 5 | [Monolith to Microservices](books/monolith-to-microservices/) | queued | Strangler fig roadmap on one Synergym module | — |

## Article format

Title formula: **Applying [Concept] from [Book] to [Real System]**

Series: Architecture in Practice (ozzo.blog)
