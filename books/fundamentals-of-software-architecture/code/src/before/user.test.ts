import { describe, it, expect } from "vitest"
import { User } from "./user.js"

// These tests document the God Model's behavior.
// The after/ tests must pass with the same assertions — that is the proof of equivalence.

describe("User God Model", () => {
  describe("role authorization", () => {
    it("admin can access dashboard and manage clients and edit settings", () => {
      const u = new User(1, "a@test.com", "admin", "metric", 80, 180)
      expect(u.canAccessDashboard()).toBe(true)
      expect(u.canManageClients()).toBe(true)
      expect(u.canEditSettings()).toBe(true)
    })

    it("trainer can access dashboard and manage clients but not edit settings", () => {
      const u = new User(2, "t@test.com", "trainer", "metric", 75, 175)
      expect(u.canAccessDashboard()).toBe(true)
      expect(u.canManageClients()).toBe(true)
      expect(u.canEditSettings()).toBe(false)
    })

    it("client cannot access dashboard, manage clients, or edit settings", () => {
      const u = new User(3, "c@test.com", "client", "metric", 70, 170)
      expect(u.canAccessDashboard()).toBe(false)
      expect(u.canManageClients()).toBe(false)
      expect(u.canEditSettings()).toBe(false)
    })
  })

  describe("unit display — metric", () => {
    const u = new User(1, "a@test.com", "admin", "metric", 80, 180)

    it("displays weight in kg", () => {
      expect(u.displayWeight()).toBe("80 kg")
    })

    it("displays height in cm", () => {
      expect(u.displayHeight()).toBe("180 cm")
    })

    it("returns raw kg for weightInPreferredUnit", () => {
      expect(u.weightInPreferredUnit()).toBe(80)
    })
  })

  describe("unit display — imperial", () => {
    const u = new User(1, "a@test.com", "admin", "imperial", 80, 180)

    it("converts weight to lbs", () => {
      expect(u.displayWeight()).toBe("176.4 lbs")
    })

    it("converts height to feet and inches", () => {
      expect(u.displayHeight()).toBe("5'11\"")
    })

    it("returns lbs for weightInPreferredUnit", () => {
      expect(u.weightInPreferredUnit()).toBeCloseTo(176.4, 1)
    })
  })
})
