# Connascence Hierarchy — From Safe to Dangerous

**What this shows:** The 9 types of connascence (coupling) ranked from weakest (safest, easiest to refactor) to strongest (most dangerous, hardest to change). Two families: static (visible at compile time) and dynamic (only visible at runtime).

**Key insight:** The further right a coupling type sits, the more it will hurt you when requirements change. Keep strong connascence local (inside a class or module). Never let dynamic connascence cross service boundaries.

```mermaid
flowchart LR
    subgraph STATIC["Static — visible at compile time"]
        CN["Name"] -->
        CTP["Type"] -->
        CM["Meaning"] -->
        CP["Position"] -->
        CA["Algorithm"]
    end

    subgraph DYNAMIC["Dynamic — only visible at runtime"]
        CE["Execution"] -->
        CT["Timing"] -->
        CV["Values"] -->
        CI["Identity"]
    end

    STATIC -->|"stronger"| DYNAMIC

    linkStyle 0,1,2,3 stroke:#6366f1,stroke-width:2px
    linkStyle 4,5,6 stroke:#e53935,stroke-width:2px
    linkStyle 7 stroke:#b71c1c,stroke-width:3px

    style STATIC fill:#f1f8e9,stroke:#558b2f,color:#1b5e20
    style DYNAMIC fill:#fce4ec,stroke:#880e4f,color:#880e4f
    style CN fill:#a5d6a7,stroke:#388e3c,color:#1b5e20
    style CTP fill:#c8e6c9,stroke:#388e3c,color:#1b5e20
    style CM fill:#fff9c4,stroke:#f9a825,color:#4e342e
    style CP fill:#ffe0b2,stroke:#ef6c00,color:#3e2723
    style CA fill:#ffccbc,stroke:#d84315,color:#3e2723
    style CE fill:#ef9a9a,stroke:#c62828,color:#7f0000
    style CT fill:#ef5350,stroke:#b71c1c,color:#fff
    style CV fill:#e53935,stroke:#b71c1c,color:#fff
    style CI fill:#b71c1c,stroke:#7f0000,color:#fff
```

**Type breakdown:**

| Type | Family | Risk | What changes together |
|---|---|---|---|
| Name | Static | Low | Method renamed everywhere |
| Type | Static | Low | Shared type definition changes |
| Meaning | Static | Medium | Magic values / conventions |
| Position | Static | Medium-High | Parameter order |
| Algorithm | Static | High | Shared algorithm implementation |
| Execution | Dynamic | High | Call order matters |
| Timing | Dynamic | Very High | Race conditions |
| Values | Dynamic | Very High | Values must match at runtime |
| Identity | Dynamic | Extreme | Same object instance required |

**The two rules (Jim Weirich):**
1. **Rule of Degree** — always convert a stronger form to a weaker one when you can
2. **Rule of Locality** — the further apart two components are, the weaker their connascence must be

**Synergym example:** `User` model has Connascence of Meaning (role logic duplicated as magic strings across controllers, policies, and views) — a yellow/orange risk that should become Connascence of Name via a proper `Role` value object.
