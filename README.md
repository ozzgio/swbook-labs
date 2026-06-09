# swbook-labs

I read software architecture books and apply the concepts to real codebases. Each book closes with a runnable TypeScript spike, a set of architecture artifacts, and a published article.

The two systems: Synergym, a Rails 8 SaaS, and a .NET enterprise codebase at my day job.

A lab is not done when the notes are written. It closes when the artifact ships and the article is published.

## What each lab produces

**Spike**
A self-contained TypeScript program with tests. Demonstrates one architectural pattern from the book. Uses generic domain language so there is no private code in the repo. Runs with `npm install && npm test`.

**Artifact**
ADRs, a decision checklist, or a migration roadmap. Applied to one of the two real codebases above.

**Article**
Published on [ozzo.blog](https://ozzo.blog) in the series *Architecture in Practice*.

## Books

| # | Book | Status | Article |
|---|------|--------|---------|
| 1 | [Fundamentals of Software Architecture](books/fundamentals-of-software-architecture/) | done | [Every Rails App Has an Architecture. Mine Just Didn't Know It Yet.](https://ozzo.blog/articles/rails-architecture-accumulated-by-default) |
| 2 | [Learning Domain-Driven Design](books/learning-domain-driven-design/) | queued | — |
| 3 | Software Architecture: The Hard Parts | queued | — |
| 4 | Building Evolutionary Architectures | queued | — |
| 5 | Monolith to Microservices | queued | — |

Book selection rationale and full 28-book scored catalogue: [`docs/adr/ADR-001-book-selection.md`](docs/adr/ADR-001-book-selection.md)
