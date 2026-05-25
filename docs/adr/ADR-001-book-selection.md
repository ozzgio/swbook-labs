# ADR-001: First 5 Books and Reading Order

**Date:** 2026-05-25
**Status:** accepted

## Context

The `sw_arch/` bundle contains 28 O'Reilly PDFs covering software architecture, distributed systems, DDD, microservices, API design, and adjacent topics. The lab series produces one Artifact and one Article per book. Starting with the wrong book, or in the wrong order, means the vocabulary for later books is missing — each subsequent book costs more effort and produces shallower output.

The selection criteria for the first 5 books:

1. **Foundation value** — does it build conceptual vocabulary used by other books?
2. **Synergym applicability** — can findings be applied immediately to the real Rails monolith?
3. **Day job applicability** — does it apply to the .NET microservices enterprise context?
4. **Blog article potential** — does it produce a concrete, relatable article for a web developer audience?

## Full Catalogue — Scored

| Book | Foundation | Synergym | Day job | Blog | Total |
|---|---|---|---|---|---|
| Fundamentals of Software Architecture | ★★★★★ | ★★★★ | ★★★★ | ★★★★★ | **18** |
| Learning Domain-Driven Design | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★★ | **20** |
| Software Architecture: The Hard Parts | ★★★★ | ★★★★★ | ★★★★★ | ★★★★★ | **19** |
| Building Evolutionary Architectures 2nd ed | ★★★★ | ★★★★ | ★★★★ | ★★★★ | **16** |
| Monolith to Microservices | ★★★ | ★★★★★ | ★★★ | ★★★★★ | **16** |
| Software Architecture Metrics | ★★★ | ★★★★ | ★★★★ | ★★★★ | 15 |
| Building Microservices 2nd ed | ★★★★ | ★★★ | ★★★★★ | ★★★★ | 16 |
| Building Multi-Tenant SaaS Architectures | ★★★ | ★★★★ | ★★★ | ★★★★ | 14 |
| Software Architecture Patterns 2nd ed | ★★★★ | ★★★ | ★★★★ | ★★★ | 14 |
| The Software Architect Elevator | ★★★ | ★★ | ★★★★ | ★★★★ | 13 |
| Mastering API Architecture | ★★★ | ★★★ | ★★★★ | ★★★ | 13 |
| Communication Patterns | ★★★ | ★★★ | ★★★★ | ★★★ | 13 |
| Building Event-Driven Microservices | ★★★ | ★★★ | ★★★★ | ★★★★ | 14 |
| Designing Distributed Systems | ★★★ | ★★ | ★★★★ | ★★★ | 12 |
| Learning Systems Thinking | ★★★ | ★★★ | ★★★ | ★★★ | 12 |
| Technology Strategy Patterns | ★★★ | ★★ | ★★★★ | ★★★ | 12 |
| RESTful Web API Patterns and Practices Cookbook | ★★ | ★★★ | ★★★ | ★★★ | 11 |
| Flow Architectures | ★★★ | ★★ | ★★★ | ★★★ | 11 |
| Foundations of Scalable Systems | ★★★ | ★★ | ★★★ | ★★★ | 11 |
| Head First Software Architecture | ★★★ | ★★★ | ★★ | ★★★ | 11 |
| Building an Event-Driven Data Mesh | ★★★ | ★★ | ★★★ | ★★★ | 11 |
| Building Micro-Frontends | ★★ | ★★ | ★★★ | ★★★ | 10 |
| Art of Agile Development 2nd ed | ★★ | ★★★ | ★★★ | ★★ | 10 |
| Microservices: Up and Running | ★★ | ★★ | ★★★ | ★★ | 9 |
| Continuous API Management 2nd ed | ★★ | ★★ | ★★★ | ★★ | 9 |
| Practical Process Automation | ★★ | ★★ | ★★ | ★★★ | 9 |
| Enabling Microservice Success | ★★ | ★ | ★★★ | ★★ | 8 |
| Serverless Development on AWS | ★★ | ★ | ★★ | ★★ | 7 |

## Decision

**First 5 books, in this order:**

| # | Book | PDF | Artifact |
|---|------|-----|----------|
| 1 | Fundamentals of Software Architecture | `fundamentalsofsoftwarearchitecture.pdf` | Architecture decision checklist + 3 ADRs for Synergym |
| 2 | Learning Domain-Driven Design | `learningdomain-drivendesign.pdf` | Bounded context map for Synergym + DDD glossary |
| 3 | Software Architecture: The Hard Parts | `softwarearchitecture_thehardparts.pdf` | 3 trade-off ADRs for Synergym (consistency, coupling, deployability) |
| 4 | Building Evolutionary Architectures | `buildingevolutionaryarchitectures2ndedition.pdf` | Fitness function suite for Synergym |
| 5 | Monolith to Microservices | `monolithtomicroservices.pdf` | Strangler fig roadmap for one Synergym module |

## Rationale

**Why Fundamentals first:** Already 80% complete (notes, ADRs, article hook written). Finishing it proves the end-to-end Lab workflow before investing in the next book. Also establishes the vocabulary (architecture characteristics, trade-off analysis, architecture styles) that every other book in this list assumes.

**Why DDD second (not Hard Parts):** Hard Parts assumes the reader already thinks in bounded contexts, aggregates, and domain events. Reading DDD first means extracting 3x more from Hard Parts. The prerequisite is real — skipping it makes Hard Parts harder, not just shallower.

**Why Hard Parts third:** Direct sequel to Fundamentals. Same authors (Richards, Ford). Builds on characteristics and trade-off vocabulary. At this point the reader has DDD language + Fundamentals language, and Hard Parts is where those two combine into real architectural decisions.

**Why Evolutionary Architectures fourth:** Introduces fitness functions — the mechanism for making architecture decisions *measurable* over time. Reading this after Hard Parts means the fitness functions are immediately applicable to the trade-offs documented in the Hard Parts ADRs. Strong blog content because metrics are concrete and demonstrable.

**Why Monolith to Microservices fifth:** The Synergym evolution story. By book 5 the reader has vocabulary (Fundamentals), bounded contexts (DDD), trade-off frameworks (Hard Parts), and measurability (Evolutionary). Monolith to Microservices is where all of that gets applied to a real migration decision. The article at this point writes itself.

## Consequences

**Positive:**
- Prerequisite order removes vocabulary gaps — each book builds on the previous
- First 3 books map directly to Synergym, generating real ADRs and improved codebase
- First 5 books cover both the solo/Rails context (Synergym) and the enterprise/.NET context (day job)
- Blog series has a coherent arc: vocabulary → domain thinking → decisions → measurement → migration

**Negative / accepted trade-offs:**
- High-scoring books deferred: Building Microservices 2nd ed (score 16), Software Architecture Metrics (score 15)
- Building Microservices skipped in first 5 because it's implementation-heavy and most useful after DDD + Hard Parts
- The order is not strictly by score — prerequisite dependency overrides score when the gap is vocabulary-critical
