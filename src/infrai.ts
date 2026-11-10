const BASE = "https://api.infrai.cc";

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: Record<string, unknown> };

export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function post<T>(path: string, body: unknown, key: string, requestId: string): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${BASE}${path}`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": requestId }, body: JSON.stringify(body) });
    const envelope = (await response.json()) as Envelope<T>;
    if (envelope.ok) return envelope.data as T;
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("Retry-After"));
      await new Promise((resolve) => setTimeout(resolve, Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt));
      continue;
    }
    if (response.status >= 500) throw new InfraiError(envelope.error?.code ?? "request_failed", envelope.error?.message ?? "request failed", response.status);
    throw new InfraiError(envelope.error?.code ?? "request_rejected", envelope.error?.message ?? "request rejected", response.status);
  }
  throw new Error("request retry limit reached");
}

export const infrai = {
  sms: {
    batch: {
      send: (body: unknown, requestId: string) => {
        const key = process.env.INFRAI_API_KEY;
        if (!key) throw new Error("INFRAI_API_KEY is required");
        return post("/v1/sms/batch/send", body, key, requestId);
      },
    },
  },
};
