// AFTER: UnitSystem value object
//
// Connascence of Meaning → Connascence of Name
//   - conversion algorithm lives in one place instead of being copied per measurement
//   - "imperial" / "metric" are private; callers use UnitSystem.imperial()
//   - adding a third unit system (e.g. stones) is a single-file change

type UnitSystemValue = "metric" | "imperial"

export class UnitSystem {
  private constructor(private readonly value: UnitSystemValue) {}

  static metric():   UnitSystem { return new UnitSystem("metric") }
  static imperial(): UnitSystem { return new UnitSystem("imperial") }

  static from(raw: string): UnitSystem {
    if (raw === "metric" || raw === "imperial") return new UnitSystem(raw)
    throw new Error(`Unknown unit system: "${raw}"`)
  }

  isImperial(): boolean { return this.value === "imperial" }

  // Weight
  convertWeight(kg: number): number {
    return this.isImperial() ? kg * 2.20462 : kg
  }

  displayWeight(kg: number): string {
    return this.isImperial()
      ? `${this.convertWeight(kg).toFixed(1)} lbs`
      : `${kg} kg`
  }

  // Height
  convertHeight(cm: number): number {
    return this.isImperial() ? cm / 2.54 : cm
  }

  displayHeight(cm: number): string {
    if (this.isImperial()) {
      const totalInches = cm / 2.54
      const feet = Math.floor(totalInches / 12)
      const inches = Math.round(totalInches % 12)
      return `${feet}'${inches}"`
    }
    return `${cm} cm`
  }

  toString(): string { return this.value }
}
