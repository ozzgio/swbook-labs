# Architecture Styles — Complexity vs Scalability

**What this shows:** Where each architecture style sits when you plot how hard it is to operate (complexity) against how well it scales. The bottom-left is where you start; the top-right is where you go when the business forces your hand.

**Key insight for Synergym:** Layered monolith sits bottom-left — lowest complexity, lowest scalability. That's exactly right for a solo developer in active feature development. Moving right costs operational complexity; every step should be justified by a real business constraint, not ambition.

```mermaid
quadrantChart
    title Architecture Styles — Complexity vs Scalability
    x-axis Low Complexity --> High Complexity
    y-axis Low Scalability --> High Scalability
    quadrant-1 Powerful but expensive
    quadrant-2 Ideal (rare in practice)
    quadrant-3 Start here
    quadrant-4 Complex but not scalable (avoid)
    Layered Monolith: [0.12, 0.12]
    Pipeline: [0.18, 0.18]
    Microkernel: [0.28, 0.22]
    Service-Based: [0.48, 0.62]
    Event-Driven: [0.72, 0.82]
    Space-Based: [0.82, 0.88]
    Microservices: [0.88, 0.85]
```

**Reading guide:**
- Start bottom-left (Layered Monolith) — simplest, cheapest, one team, one deploy
- Move right only when a real constraint forces it (scale, team size, domain isolation)
- Space-Based and Microservices are top-right — maximum power, maximum cost
- There is no "best" style — only the least-wrong style for your current constraints
