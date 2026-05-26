import { describe, it, expect } from "vitest"
import { Role } from "./role.js"

describe("Role value object", () => {
  it("rejects unknown role strings at the boundary", () => {
    expect(() => Role.from("superuser")).toThrow('Unknown role: "superuser"')
  })

  describe("admin", () => {
    const role = Role.admin()
    it("can access dashboard",    () => expect(role.canAccessDashboard()).toBe(true))
    it("can manage clients",      () => expect(role.canManageClients()).toBe(true))
    it("can edit settings",       () => expect(role.canEditSettings()).toBe(true))
  })

  describe("trainer", () => {
    const role = Role.trainer()
    it("can access dashboard",    () => expect(role.canAccessDashboard()).toBe(true))
    it("can manage clients",      () => expect(role.canManageClients()).toBe(true))
    it("cannot edit settings",    () => expect(role.canEditSettings()).toBe(false))
  })

  describe("client", () => {
    const role = Role.client()
    it("cannot access dashboard", () => expect(role.canAccessDashboard()).toBe(false))
    it("cannot manage clients",   () => expect(role.canManageClients()).toBe(false))
    it("cannot edit settings",    () => expect(role.canEditSettings()).toBe(false))
  })

  it("round-trips through Role.from and toString", () => {
    expect(Role.from("admin").toString()).toBe("admin")
    expect(Role.from("trainer").toString()).toBe("trainer")
    expect(Role.from("client").toString()).toBe("client")
  })
})
