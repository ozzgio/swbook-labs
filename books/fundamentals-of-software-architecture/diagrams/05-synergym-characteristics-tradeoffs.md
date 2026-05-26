# Synergym — Architecture Characteristics Decision

**What this shows:** The explicit trade-off decision for Synergym's architecture characteristics. Three chosen, five deliberately deferred — with the cost of each deferral stated honestly. This is the artifact that didn't exist before reading the book.

**Key insight:** Every system already has architecture characteristics. The only question is whether they were *chosen* or *accumulated*. This diagram is what "choosing deliberately" looks like.

```mermaid
flowchart TD
    subgraph CHOSEN["Chosen — actively optimized for"]
        AGI["Agility"]
        SIM["Simplicity"]
        TEST["Testability"]
    end

    CHOSEN -- "paid for by deferring" --> DEFERRED

    linkStyle 0 stroke:#6366f1,stroke-width:2px

    subgraph DEFERRED["Deferred — accepted trade-offs"]
        SCALE["Scalability"]
        ELAST["Elasticity"]
        FAULT["Fault Tolerance"]
        DEPLOY["Deployability"]
        MOD["Modularity"]
    end

    style CHOSEN fill:#e8f5e9,stroke:#2e7d32,color:#1b5e20
    style DEFERRED fill:#fff3e0,stroke:#e65100,color:#3e2723
    style AGI fill:#c8e6c9,stroke:#388e3c,color:#1b5e20
    style SIM fill:#c8e6c9,stroke:#388e3c,color:#1b5e20
    style TEST fill:#c8e6c9,stroke:#388e3c,color:#1b5e20
    style SCALE fill:#ffccbc,stroke:#d84315,color:#3e2723
    style ELAST fill:#ffccbc,stroke:#d84315,color:#3e2723
    style FAULT fill:#ffccbc,stroke:#d84315,color:#3e2723
    style DEPLOY fill:#ffe0b2,stroke:#ef6c00,color:#3e2723
    style MOD fill:#ffe0b2,stroke:#ef6c00,color:#3e2723
```

**Chosen characteristics:**

| Characteristic | How Synergym achieves it | What it buys |
|---|---|---|
| Agility | Rails conventions, monolith = local changes, no distributed overhead | Fast feature iteration for a solo developer |
| Simplicity | Single deploy, SolidQueue, SolidCache, one PostgreSQL instance | No operational complexity — no Redis, no Memcached |
| Testability | RSpec + FactoryBot, service isolation, fast local feedback loop | Confidence in refactors without integration overhead |

**Deferred characteristics:**

| Characteristic | Cost accepted | Trigger to revisit |
|---|---|---|
| Scalability | Vertical scaling only, single DB ceiling | Sustained 10k+ concurrent users |
| Elasticity | No horizontal scaling | Unpredictable traffic spikes become a problem |
| Fault Tolerance | One process = full outage | SLA requirements from clients |
| Deployability | No zero-downtime deploys | Second developer joins the team |
| Modularity | God Models accepted as known debt | UserPreferences extraction first when ready |

**The honest read:**
- Green = the system actively works toward these
- Orange = known risk, trigger defined, not a priority yet
- Red = real cost, accepted deliberately

**What changed after reading the book:** Before — these were unspoken assumptions. After — each one has a trigger condition that would cause a revisit. That's the difference between architecture that accumulated and architecture that was decided.
