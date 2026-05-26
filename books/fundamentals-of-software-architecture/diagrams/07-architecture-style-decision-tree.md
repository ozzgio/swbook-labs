# Architecture Style Decision Tree

**What this shows:** How to choose an architecture style based on real constraints — team size, scale needs, domain complexity, deployment model. Not "what is the best style" but "what is the least-wrong style given *these* constraints."

**Key insight:** The wrong question is "which style is best?" The right question is "which style fits my current constraints?" Every style on this tree is the correct answer for someone.

```mermaid
flowchart TD
    START["What are my constraints?"] --> Q1{"Single team,\nsingle codebase?"}

    Q1 -->|"yes"| Q2{"Need plugin\nsystem?"}
    Q1 -->|"no"| Q3{"Domain boundaries\nclear?"}

    Q2 -->|"yes"| MKERNEL["Microkernel"]
    Q2 -->|"no"| Q4{"Data pipeline\nor ETL focus?"}

    Q4 -->|"yes"| PIPE["Pipeline"]
    Q4 -->|"no"| LAYERED["Layered Monolith"]

    Q3 -->|"no — domains\ntoo tangled"| SBASED["Service-Based"]
    Q3 -->|"yes"| Q5{"Need extreme\nscale or elasticity?"}

    Q5 -->|"yes"| Q6{"Event-driven\nby nature?"}
    Q5 -->|"no"| Q7{"Independent deploy\nper team?"}

    Q6 -->|"yes"| EDRIVEN["Event-Driven"]
    Q6 -->|"no"| SPACED["Space-Based"]

    Q7 -->|"yes"| MSVC["Microservices"]
    Q7 -->|"no"| SBASED

    linkStyle 0 stroke:#0066ff,stroke-width:2px
    linkStyle 1 stroke:#0066ff,stroke-width:2px
    linkStyle 2 stroke:#0066ff,stroke-width:2px
    linkStyle 3 stroke:#2e7d32,stroke-width:2px
    linkStyle 4 stroke:#0066ff,stroke-width:2px
    linkStyle 5 stroke:#2e7d32,stroke-width:2px
    linkStyle 6 stroke:#0066ff,stroke-width:2px
    linkStyle 7 stroke:#ff9933,stroke-width:2.5px
    linkStyle 8 stroke:#0066ff,stroke-width:2px
    linkStyle 9 stroke:#0066ff,stroke-width:2px
    linkStyle 10 stroke:#2e7d32,stroke-width:2px
    linkStyle 11 stroke:#0066ff,stroke-width:2px
    linkStyle 12 stroke:#2e7d32,stroke-width:2px
    linkStyle 13 stroke:#0066ff,stroke-width:2px

    style START fill:#f1f5f9,stroke:#475569,color:#1e293b
    style Q1 fill:#fef9c3,stroke:#ca8a04,color:#422006
    style Q2 fill:#fef9c3,stroke:#ca8a04,color:#422006
    style Q3 fill:#fef9c3,stroke:#ca8a04,color:#422006
    style Q4 fill:#fef9c3,stroke:#ca8a04,color:#422006
    style Q5 fill:#fef9c3,stroke:#ca8a04,color:#422006
    style Q6 fill:#fef9c3,stroke:#ca8a04,color:#422006
    style Q7 fill:#fef9c3,stroke:#ca8a04,color:#422006
    style LAYERED fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style PIPE fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style MKERNEL fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style SBASED fill:#ede9fe,stroke:#7c3aed,color:#3b0764
    style EDRIVEN fill:#fff3e0,stroke:#e65100,color:#3e2723
    style SPACED fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    style MSVC fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
```

**Style characteristics at a glance:**

| Style | Complexity | Scalability | Team fit | Synergym fit |
|---|---|---|---|---|
| Layered Monolith | Low | Low | 1 team, 1 deploy | **Now** — correct for current phase |
| Pipeline | Low | Low-Med | Data/ETL focus | No — wrong domain |
| Microkernel | Low-Med | Low | Plugin ecosystems | No — not a platform |
| Service-Based | Med | Med | 2-5 teams, domain split | When second team joins |
| Event-Driven | High | High | Async-first workflows | When traffic events matter |
| Space-Based | Very High | Very High | Extreme scale | Not in the foreseeable future |
| Microservices | Very High | High | Many teams, CI/CD maturity | Not in the foreseeable future |

**Where Synergym is on this tree:**
Start → Single team → No plugins → No pipeline focus → **Layered Monolith**. The tree confirms the current choice. Revisit when the team grows or a clear domain boundary emerges that forces a split.
