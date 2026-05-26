# Architecture Quantum — Going, Going, Gone Case Study

**What this shows:** Why "one set of architecture characteristics" is not always realistic. The Going, Going, Gone online auction system has three groups of users with radically different needs — each maps to a separate architecture quantum with its own characteristics profile.

**Key insight:** Before the quantum concept, an architect would try to design one system that satisfies all requirements. The quantum lens reveals that you're actually designing three different systems that happen to communicate. That changes the architecture completely.

```mermaid
flowchart TB
    subgraph Q1["Quantum 1 — Bidder Feedback"]
        Q1C["Availability HIGH · Performance HIGH · Scalability HIGH"]
        BS["Bid Streamer"]
        VC["Video Capture"]
        VS["Video Streamer"]
    end

    subgraph Q2["Quantum 2 — Auctioneer · HIGHEST BAR"]
        Q2C["Availability HIGH · Reliability HIGH · Security HIGH"]
        AC["Auctioneer Capture"]
        AS["Auction Session"]
    end

    subgraph Q3["Quantum 3 — Bidder"]
        Q3C["Reliability HIGH · Availability HIGH · Elasticity MED"]
        BC["Bid Capture"]
        BT["Bid Tracker"]
        PAY["Payment — async, 500ms budget"]
    end

    BC -- "async bid event" --> BS
    BC -- "async bid event" --> BT
    AS -- "bid window open/close" --> BC
    AC -- "controls session" --> AS
    VC --> VS

    style Q1 fill:#e3f2fd,stroke:#1565c0
    style Q2 fill:#fce4ec,stroke:#880e4f
    style Q3 fill:#e8f5e9,stroke:#2e7d32
    style AS fill:#ef9a9a,stroke:#c62828
    style Q1C fill:#e3f2fd,stroke:#1565c0,color:#1565c0
    style Q2C fill:#fce4ec,stroke:#880e4f,color:#880e4f
    style Q3C fill:#e8f5e9,stroke:#2e7d32,color:#2e7d32
```

**Why the Auctioneer quantum has the highest bar:**
If a single bidder loses connection → one unhappy user.
If the auctioneer loses connection → the entire auction stops for everyone.
Same system, radically different availability requirements — impossible to satisfy with one architecture.

**The lesson:** Quantum analysis happens *before* you choose an architecture style. You can't pick microservices vs monolith until you know how many quanta the system has.
