// AFTER: Role value object
//
// Connascence of Meaning → Connascence of Name (diagram 02, green zone)
//   - "admin" / "trainer" / "client" strings are now private to this module
//   - callers only know: Role.admin(), role.canAccessDashboard() — no magic strings
//   - permission rules live in one place; changing "admin" to "superuser" is a single edit

type RoleValue = "admin" | "trainer" | "client"

export class Role {
  private constructor(private readonly value: RoleValue) {}

  static admin():   Role { return new Role("admin") }
  static trainer(): Role { return new Role("trainer") }
  static client():  Role { return new Role("client") }

  static from(raw: string): Role {
    if (raw === "admin" || raw === "trainer" || raw === "client") {
      return new Role(raw)
    }
    throw new Error(`Unknown role: "${raw}"`)
  }

  isAdmin():   boolean { return this.value === "admin" }
  isTrainer(): boolean { return this.value === "trainer" }
  isClient():  boolean { return this.value === "client" }

  // Permission rules are co-located with the thing they describe
  canAccessDashboard(): boolean { return this.isAdmin() || this.isTrainer() }
  canManageClients():   boolean { return this.isAdmin() || this.isTrainer() }
  canEditSettings():    boolean { return this.isAdmin() }

  toString(): string { return this.value }
}
