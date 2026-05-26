import { describe, it, expect } from "vitest"
import { UnitSystem } from "./unit-system.js"

describe("UnitSystem value object", () => {
  it("rejects unknown unit strings at the boundary", () => {
    expect(() => UnitSystem.from("stones")).toThrow('Unknown unit system: "stones"')
  })

  describe("metric", () => {
    const us = UnitSystem.metric()
    it("displays weight in kg",  () => expect(us.displayWeight(80)).toBe("80 kg"))
    it("displays height in cm",  () => expect(us.displayHeight(180)).toBe("180 cm"))
    it("returns raw kg",         () => expect(us.convertWeight(80)).toBe(80))
    it("returns raw cm",         () => expect(us.convertHeight(180)).toBe(180))
  })

  describe("imperial", () => {
    const us = UnitSystem.imperial()
    it("converts weight to lbs",           () => expect(us.displayWeight(80)).toBe("176.4 lbs"))
    it("converts height to feet/inches",   () => expect(us.displayHeight(180)).toBe("5'11\""))
    it("returns lbs for convertWeight",    () => expect(us.convertWeight(80)).toBeCloseTo(176.4, 1))
    it("returns total inches for height",  () => expect(us.convertHeight(180)).toBeCloseTo(70.9, 1))
  })
})
