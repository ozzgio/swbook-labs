# Architecture Quantum — Going, Going, Gone Case Study

**What this shows:** Why "one set of architecture characteristics" is not always realistic. The Going, Going, Gone online auction system has three groups of users with radically different needs — each maps to a separate architecture quantum with its own characteristics profile.

**Key insight:** Before the quantum concept, an architect would try to design one system that satisfies all requirements. The quantum lens reveals that you're actually designing three different systems that happen to communicate. That changes the architecture completely.

```mermaid
flowchart TB
    subgraph Q1["Quantum 1 — Bidder Feedback"]
        Q1C["Availability · Performance · Scalability — all HIGH"]
        BS["Bid Streamer"]
        VC["Video Capture"]
        VS["Video Streamer"]
    end

    subgraph Q2["Quantum 2 — Auctioneer — highest bar"]
        Q2C["Availability · Reliability · Security — all HIGH"]
        AC["Auctioneer Capture"]
        AS["Auction Session"]
    end

    subgraph Q3["Quantum 3 — Bidder"]
        Q3C["Reliability HIGH · Availability HIGH · Elasticity MED"]
        BC["Bid Capture"]
        BT["Bid Tracker"]
        PAY["Payment — async"]
    end

    BC -- "async bid event" --> BS
    BC -- "async bid event" --> BT
    AS -- "bid window open/close" --> BC
    AC -- "controls session" --> AS
    VC --> VS

    style Q1 fill:#e3f2fd,stroke:#1565c0,color:#0d2137
    style Q2 fill:#fce4ec,stroke:#880e4f,color:#3b0020
    style Q3 fill:#e8f5e9,stroke:#2e7d32,color:#0a2e0d
    style Q1C fill:#bbdefb,stroke:#1565c0,color:#0d2137
    style Q2C fill:#f8bbd9,stroke:#880e4f,color:#3b0020
    style Q3C fill:#c8e6c9,stroke:#2e7d32,color:#0a2e0d
    style AS fill:#ef9a9a,stroke:#c62828,color:#7f0000
```

**Quantum characteristics:**

| Quantum | Users | Key requirement | Why it's different |
|---|---|---|---|
| Q1 — Bidder Feedback | All bidders watching | Performance + scalability | Streams video and bid state to N concurrent viewers |
| Q2 — Auctioneer | One auctioneer per session | Reliability + security | Single point of failure — if auctioneer drops, the auction stops for everyone |
| Q3 — Bidder | Active bidders | Reliability + elasticity | Spikes on lot open, async payment tolerance, per-user correctness |

**Why the Auctioneer quantum has the highest bar:**
If a single bidder loses connection → one unhappy user.
If the auctioneer loses connection → the entire auction stops for everyone.
Same system, radically different availability requirements — impossible to satisfy with one architecture.

**The lesson:** Quantum analysis happens *before* you choose an architecture style. You can't pick microservices vs monolith until you know how many quanta the system has.
