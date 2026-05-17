# Architecture Characteristics — Synergym Decision Record

**Date:** 2026-05-17
**Source:** Fundamentals of Software Architecture, Ch. 4–5

## The 3 characteristics Synergym is designed for

These are the characteristics the system actively optimizes for. Every other trade-off is evaluated against these.

### 1. Agility
**Definition:** The ability to respond quickly to change — add features, fix bugs, adjust behavior — without systemic friction.

**Why it's the primary characteristic:**
Solo developer. Active product development. Business requirements change faster than the architecture can solidify. Agility wins over every other characteristic until the product is stable.

**How the current architecture supports it:**
- Rails conventions reduce decision fatigue
- Single codebase — changes are local
- PostgreSQL + ActiveRecord — no ORM translation layer
- No distributed systems complexity

**What it costs:**
- Scalability: a single Puma process and one DB limit horizontal scaling
- Modularity: shared User model is the price of fast iteration

---

### 2. Simplicity
**Definition:** Operational and cognitive simplicity — easy to understand, deploy, monitor, and debug.

**Why it's the second characteristic:**
Solo operation. No DevOps team. Every added component is a new failure surface and a new on-call burden. Simplicity is not laziness — it is a deliberate capacity constraint.

**How the current architecture supports it:**
- Single deploy target (NUC + Puma)
- SolidQueue (DB-backed jobs, no Redis dependency)
- SolidCache and SolidCable (same pattern)
- One PostgreSQL instance, one schema

**What it costs:**
- Fault tolerance: one process crash = full downtime
- Elasticity: cannot scale individual components

---

### 3. Learnability
**Definition:** How quickly a new developer (or returning Giorgio after 3 months away) can understand the system well enough to make a change safely.

**Why it's the third characteristic:**
Rails conventions are the primary learnability investment. A new developer who knows Rails can navigate 80% of the system on day one. The architecture should not fight this.

**How the current architecture supports it:**
- Standard Rails structure — no custom frameworks
- Pundit policies — authorization is predictable and co-located
- ViewComponent — UI logic is isolated and findable

**What it costs:**
- Learnability degrades as God Models grow — `user.rb` and `dashboards_controller.rb` are now learners' first obstacles

---

## Explicitly deferred characteristics (and why)

| Characteristic | Deferred until | Trigger |
|---|---|---|
| **Scalability** | Horizontal growth demand | >500 concurrent users or DB at 80% CPU |
| **Elasticity** | Multi-tenant or burst load | Second large client with different SLA |
| **Fault tolerance** | Revenue-critical path added | Payment processing or SLA commitment |
| **Deployability** | Second developer joins | Coordinating deploys becomes a bottleneck |
| **Testability** | Coverage drops below 60% on critical paths | First regressions traced to untested controllers |

## How to use this checklist

Before adding a new component, service, or dependency, evaluate:

1. Does it improve one of the 3 chosen characteristics?
2. Does it degrade one of the 3 chosen characteristics more than it helps?
3. Does it accidentally optimize for a deferred characteristic at the cost of an active one?

If the answers are: no / yes / yes — don't add it.
