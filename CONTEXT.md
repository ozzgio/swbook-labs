# swbook-labs — Domain Context

> Terms resolved during the design of this repo. Update as new concepts stabilize.

---

## Lab

A unit of work tied to one book. A Lab is complete when it produces one **Artifact**, one **Spike**, and one **Article Hook**. A Lab is not complete when it produces only notes.

## Spike

A self-contained, runnable TypeScript program (with tests) that demonstrates one architectural pattern from the book. Lives in `books/<book-slug>/code/`. Must run with `npm install && npm test`. No Rails, no framework dependencies — the pattern must be visible without framework noise.

Spikes are public-safe: they use generic domain language (User, Order, Product), not private Synergym model names or proprietary code.

The notes.md for each book maps the spike pattern back to all three real stacks: TypeScript (the spike), Ruby/Rails (Synergym), C#/.NET (day job at ALTEN).

## Artifact

The shipping-ready output of a Lab. One of:
- Code spike (TypeScript, runnable, tested)
- ADR (architecture decision record, written for a real system)
- Decision checklist (scored trade-off canvas)
- Roadmap (sequenced migration plan tied to a real codebase)

No Lab ships without an Artifact. Notes alone are not an Artifact.

## Article Hook

A file (`article-hook.md`) that captures the working title, argument angle, proof artifact, and publication checklist for the ozzo.blog article. Written before the article, updated as the Lab progresses. An Article Hook is a commitment, not a draft.

## Catalogue

All 28 O'Reilly PDFs in the `sw_arch/` bundle on the MacBook. Scored in `docs/adr/ADR-001-book-selection.md`. The full list and scores live there.

## Reading Order

The sequence in which Labs are executed. Determined by prerequisite dependency, not interest. A book that assumes vocabulary from another book must come after it. See `ADR-001-book-selection.md`.

## Real System

The codebase where Lab findings are actually applied. Currently two:
- **Synergym** (`synergym_next`, private) — Rails 8 SaaS fitness platform
- **Day job** (ALTEN, private) — .NET 8 microservices, enterprise context

Changes to Real Systems are not tracked in this repo (both are private). The Spike demonstrates the pattern; the notes.md documents how the pattern was applied in the Real System.
