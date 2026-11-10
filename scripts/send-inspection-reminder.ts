import { decideInspectionReminder } from "../src/maintenance_reminder.ts";
import { infrai } from "../src/infrai.ts";

const input = { propertyId: "oak-park", unit: "3B", tenantName: "Mina", tenantPhone: process.env.DEMO_TENANT_PHONE ?? "+15550001111", requestId: "inspection-oak-park-3b", scheduledFor: "2026-11-04T15:00:00.000Z" };
const decision = decideInspectionReminder(input, new Set((process.env.SUPPRESSED_NUMBERS ?? "").split(",").filter(Boolean)));
if (decision.action === "suppress") { console.log("message suppressed", decision.reason); process.exit(0); }
const result = await infrai.sms.batch.send({ messages: [{ to: decision.to, text: decision.text }] }, input.requestId);
console.log("inspection reminder sent", result);
