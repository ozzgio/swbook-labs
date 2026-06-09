# swbook-labs

Reading software architecture books is easy. Applying them is where most of the value gets lost.

This repo is a study system: each book produces one runnable TypeScript spike, one set of architecture artifacts, and one published article. Everything is applied to real codebases — a Rails 8 SaaS ([synergym.fit](https://synergym.fit)) and a .NET enterprise system at the day job.

A lab is not done when the notes are written. It closes when the artifact ships and the article is published.

## What each lab produces

- **Spike** — a self-contained TypeScript program with tests, demonstrating one architectural pattern from the book. Generic domain language (User, Order, Product), no private code. Runs with `npm install && npm test`.
- **Artifact** — ADRs, a decision checklist, or a migration roadmap applied to a real system, not a synthetic example.
- **Article** — published on [ozzo.blog](https://ozzo.blog) in the series *Architecture in Practice*.

## Books

| # | Book | Status | Article |
|---|------|--------|---------|
| 1 | [Fundamentals of Software Architecture](books/fundamentals-of-software-architecture/) | done | [Every Rails App Has an Architecture. Mine Just Didn't Know It Yet.](https://ozzo.blog/articles/rails-architecture-accumulated-by-default) |
| 2 | [Learning Domain-Driven Design](books/learning-domain-driven-design/) | queued | — |
| 3 | Software Architecture: The Hard Parts | queued | — |
| 4 | Building Evolutionary Architectures | queued | — |
| 5 | Monolith to Microservices | queued | — |

Book selection rationale and full 28-book scored catalogue: [`docs/adr/ADR-001-book-selection.md`](docs/adr/ADR-001-book-selection.md)
