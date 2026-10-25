import { describe, expect, it } from "vitest";
import { locationFromResponse, publicAddress } from "./activity";

describe("location privacy", () => {
  it("keeps only city, state/region and country, never an IP", () => {
    expect(locationFromResponse({ success: true, city: "Los Angeles", region: "California", country: "United States", ip: "8.8.8.8", latitude: 34 })).toEqual({ city: "Los Angeles", region: "California", country: "United States" });
  });
  it("does not geolocate local or reserved addresses", () => {
    for (const ip of ["127.0.0.1", "10.0.0.1", "192.168.1.1", "::1", "fc00::1", "::ffff:127.0.0.1", "invalid", "203.0.113.1"]) expect(publicAddress(ip)).toBeNull();
    expect(publicAddress("8.8.8.8")).toBe("8.8.8.8");
  });
  it("does not turn a failed lookup into a location", () => {
    expect(locationFromResponse({ success: false, message: "Rate limited" })).toBeNull();
  });
});