import assert from "node:assert/strict";
import { decideInspectionReminder } from "../src/maintenance_reminder.ts";

const request = { propertyId: "oak-park", unit: "3B", tenantName: "Mina", tenantPhone: "+15550001111", requestId: "r-1", scheduledFor: "2026-11-04T15:00:00.000Z" };
assert.deepEqual(decideInspectionReminder(request, new Set(["+15550001111"])), { action: "suppress", reason: "tenant_opted_out" });
assert.equal(decideInspectionReminder(request, new Set()).action, "send");
console.log("maintenance reminder decision test passed");
