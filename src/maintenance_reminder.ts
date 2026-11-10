import { z } from "zod";

export const maintenanceRequest = z.object({ propertyId: z.string().min(1), unit: z.string().min(1), tenantName: z.string().min(1), tenantPhone: z.string().min(7), requestId: z.string().min(1), scheduledFor: z.string().datetime() });
export type MaintenanceRequest = z.infer<typeof maintenanceRequest>;

export type ReminderDecision = { action: "send" | "suppress"; reason: "inspection_reminder" | "tenant_opted_out"; to?: string; text?: string };

export function decideInspectionReminder(input: unknown, suppressedNumbers: ReadonlySet<string>): ReminderDecision {
  const request = maintenanceRequest.parse(input);
  if (suppressedNumbers.has(request.tenantPhone)) return { action: "suppress", reason: "tenant_opted_out" };
  return { action: "send", reason: "inspection_reminder", to: request.tenantPhone, text: `Inspection for unit ${request.unit} at ${request.scheduledFor}. Reply to your property team with questions.` };
}
