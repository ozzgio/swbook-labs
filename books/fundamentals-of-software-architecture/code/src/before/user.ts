// BEFORE: God Model — representative of Synergym's User class (730 LOC, 15+ associations)
//
// Connascence of Meaning problems (CoM → diagram 02, orange risk):
//   - "admin" / "trainer" / "client" strings appear 8 times across this file alone
//   - every caller must know and duplicate these magic strings
//   - "metric" / "imperial" duplicated across every conversion method
//   - unit conversion algorithm is repeated for weight and height separately
//
// The fix is not a different architecture style — it is discipline within the layered monolith.

export class User {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public role: string,           // CoM: caller must know "admin" | "trainer" | "client"
    public preferredUnit: string,  // CoM: caller must know "metric" | "imperial"
    public weightKg: number,
    public heightCm: number,
  ) {}

  // Authorization — role strings duplicated here and in every controller/policy/view
  isAdmin(): boolean    { return this.role === "admin" }
  isTrainer(): boolean  { return this.role === "trainer" }
  isClient(): boolean   { return this.role === "client" }

  canAccessDashboard(): boolean {
    return this.role === "admin" || this.role === "trainer"  // CoM x2
  }

  canManageClients(): boolean {
    return this.role === "admin" || this.role === "trainer"  // CoM x2 — identical to above
  }

  canEditSettings(): boolean {
    return this.role === "admin"  // CoM
  }

  // Unit conversion — algorithm duplicated for each measurement
  displayWeight(): string {
    if (this.preferredUnit === "imperial") {           // CoM
      return `${(this.weightKg * 2.20462).toFixed(1)} lbs`
    }
    return `${this.weightKg} kg`
  }

  displayHeight(): string {
    if (this.preferredUnit === "imperial") {           // CoM — same string, different method
      const inches = this.heightCm / 2.54
      const feet = Math.floor(inches / 12)
      const rem  = Math.round(inches % 12)
      return `${feet}'${rem}"`
    }
    return `${this.heightCm} cm`
  }

  weightInPreferredUnit(): number {
    if (this.preferredUnit === "imperial") return this.weightKg * 2.20462  // CoM + duplicate algorithm
    return this.weightKg
  }

  heightInPreferredUnit(): number {
    if (this.preferredUnit === "imperial") return this.heightCm / 2.54    // CoM + duplicate algorithm
    return this.heightCm
  }
}
