import { describe, it, expect } from "vitest"
import { User } from "./user.js"
import { Role } from "./role.js"
import { UnitSystem } from "./unit-system.js"

// Equivalence proof: same assertions as before/user.test.ts — different construction, same behavior.
// The God Model's behavior is fully preserved. Only the coupling changed.

describe("User — after decomposition", () => {
  describe("role authorization", () => {
    it("admin can access dashboard and manage clients and edit settings", () => {
      const u = new User(1, "a@test.com", Role.admin(), UnitSystem.metric(), 80, 180)
      expect(u.canAccessDashboard()).toBe(true)
      expect(u.canManageClients()).toBe(true)
      expect(u.canEditSettings()).toBe(true)
    })

    it("trainer can access dashboard and manage clients but not edit settings", () => {
      const u = new User(2, "t@test.com", Role.trainer(), UnitSystem.metric(), 75, 175)
      expect(u.canAccessDashboard()).toBe(true)
      expect(u.canManageClients()).toBe(true)
      expect(u.canEditSettings()).toBe(false)
    })

    it("client cannot access dashboard, manage clients, or edit settings", () => {
      const u = new User(3, "c@test.com", Role.client(), UnitSystem.metric(), 70, 170)
      expect(u.canAccessDashboard()).toBe(false)
      expect(u.canManageClients()).toBe(false)
      expect(u.canEditSettings()).toBe(false)
    })
  })

  describe("unit display — metric", () => {
    const u = new User(1, "a@test.com", Role.admin(), UnitSystem.metric(), 80, 180)
    it("displays weight in kg",        () => expect(u.displayWeight()).toBe("80 kg"))
    it("displays height in cm",        () => expect(u.displayHeight()).toBe("180 cm"))
    it("returns raw kg",               () => expect(u.weightInPreferredUnit()).toBe(80))
  })

  describe("unit display — imperial", () => {
    const u = new User(1, "a@test.com", Role.admin(), UnitSystem.imperial(), 80, 180)
    it("converts weight to lbs",       () => expect(u.displayWeight()).toBe("176.4 lbs"))
    it("converts height to feet/inches", () => expect(u.displayHeight()).toBe("5'11\""))
    it("returns lbs",                  () => expect(u.weightInPreferredUnit()).toBeCloseTo(176.4, 1))
  })

  it("accepts Role and UnitSystem built from raw strings (ORM hydration path)", () => {
    const u = new User(1, "a@test.com", Role.from("trainer"), UnitSystem.from("imperial"), 70, 170)
    expect(u.canAccessDashboard()).toBe(true)
    expect(u.displayWeight()).toBe("154.3 lbs")
  })
})
