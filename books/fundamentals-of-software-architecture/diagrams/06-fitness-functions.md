# Fitness Functions — Automated Architecture Governance

**What this shows:** Fitness functions are not unit tests — they test architecture properties, not business logic. This diagram shows how they work as a governance gate in CI, applied to Synergym's actual coupling problems.

**Key insight:** Without fitness functions, architecture characteristics drift silently. A 200 LOC controller becomes 400, then 800, and nobody notices until the damage is done. Fitness functions make the drift visible at commit time, not at code review.

```mermaid
flowchart LR
    CODE["Code Change"] --> FF1 & FF2 & FF3 & FF4

    subgraph CI["CI — Triggered Fitness Functions"]
        FF1["Class LOC < 400"]
        FF2["Cyclomatic complexity < 10"]
        FF3["Test coverage > 80%"]
        FF4["No layer dependency skips"]
    end

    FF1 & FF2 & FF3 & FF4 --> GATE{"All pass?"}

    GATE -->|"yes"| DEPLOY["Production"]
    GATE -->|"no"| BLOCK["Blocked — alert developer"]
    BLOCK -->|"fix"| CODE

    DEPLOY --> M1 & M2

    subgraph MONITOR["Production — Continual Fitness Functions"]
        M1["Response p95 < 500ms"]
        M2["Error rate < 0.1%"]
    end

    linkStyle 0,1,2,3 stroke:#0066ff,stroke-width:2px
    linkStyle 4 stroke:#0066ff,stroke-width:2px
    linkStyle 5 stroke:#2e7d32,stroke-width:2.5px
    linkStyle 6 stroke:#dc2626,stroke-width:2px,stroke-dasharray:5 5
    linkStyle 7 stroke:#ff9933,stroke-width:2px
    linkStyle 8,9 stroke:#475569,stroke-width:2px

    style CI fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style MONITOR fill:#e8f5e9,stroke:#2e7d32,color:#1b5e20
    style CODE fill:#f1f5f9,stroke:#475569,color:#1e293b
    style GATE fill:#fef9c3,stroke:#ca8a04,color:#422006
    style DEPLOY fill:#c8e6c9,stroke:#388e3c,color:#1b5e20
    style BLOCK fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    style FF1 fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style FF2 fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style FF3 fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style FF4 fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style M1 fill:#c8e6c9,stroke:#388e3c,color:#1b5e20
    style M2 fill:#c8e6c9,stroke:#388e3c,color:#1b5e20
```

**Synergym fitness function catalogue:**

| Function | Type | Characteristic protected | Current state | Target |
|---|---|---|---|---|
| Class LOC < 400 | Triggered (CI) | Modularity | `User` 730, `DashboardsController` 874 | Fail today |
| Cyclomatic complexity < 10 | Triggered (CI) | Testability | Unknown — not measured | Measure first |
| Test coverage > 80% | Triggered (CI) | Testability | Not tracked per-layer | Measure first |
| No layer dependency skips | Triggered (CI) | Modularity | `CTRL → User`, `Jobs → User` | Fail today |
| Response p95 < 500ms | Continual | Performance | Unmeasured in production | Add monitoring |
| Error rate < 0.1% | Continual | Reliability | Unmeasured | Add monitoring |

**The honest read:** Two fitness functions would fail today if Synergym ran them. That is not a failure of the architecture style — it is the coupling debt that accumulated without governance. The fix is to add the gate, watch it fail, then fix the violations one by one.
