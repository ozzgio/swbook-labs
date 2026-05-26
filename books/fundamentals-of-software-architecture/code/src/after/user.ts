// AFTER: User — clean domain model
//
// Responsibilities: identity + delegation. Nothing else.
//   - no magic strings
//   - no conversion algorithms
//   - no permission logic
//   - each concern is owned by the value object that understands it

import { Role } from "./role.js"
import { UnitSystem } from "./unit-system.js"

export class User {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly role: Role,
    public readonly unitSystem: UnitSystem,
    public readonly weightKg: number,
    public readonly heightCm: number,
  ) {}

  // Delegation — User no longer knows what "admin" means
  canAccessDashboard(): boolean { return this.role.canAccessDashboard() }
  canManageClients():   boolean { return this.role.canManageClients() }
  canEditSettings():    boolean { return this.role.canEditSettings() }

  // Delegation — User no longer knows what "imperial" means
  displayWeight(): string  { return this.unitSystem.displayWeight(this.weightKg) }
  displayHeight(): string  { return this.unitSystem.displayHeight(this.heightCm) }
  weightInPreferredUnit(): number { return this.unitSystem.convertWeight(this.weightKg) }
  heightInPreferredUnit(): number { return this.unitSystem.convertHeight(this.heightCm) }
}
