import { describe, it, expect } from "vitest";
import { requiredRoleForPath } from "@/components/DashboardGate";

describe("requiredRoleForPath — owned experiences", () => {
  it("opens owned-experience management to any provider role", () => {
    expect(requiredRoleForPath("/dashboard/service-provider/my-listings")).toBe("any-provider");
    expect(requiredRoleForPath("/dashboard/service-provider/edit-experience/abc")).toBe("any-provider");
    expect(requiredRoleForPath("/dashboard/service-provider/listing/abc/slots")).toBe("any-provider");
  });
  it("keeps the rest of the service-provider area role-gated", () => {
    expect(requiredRoleForPath("/dashboard/service-provider")).toBe("service-provider");
    expect(requiredRoleForPath("/dashboard/service-provider/new-experience")).toBe("service-provider");
    expect(requiredRoleForPath("/dashboard/service-provider/my-stays")).toBe("service-provider");
    expect(requiredRoleForPath("/dashboard/trip-organizer")).toBe("trip-organizer");
  });
});
