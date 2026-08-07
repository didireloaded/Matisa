import { IntegrationName, IntegrationStatus, FeatureFlags } from "./types";
import { checkIntegrationStatus, computeFeatureFlags } from "./config";

const ALL_INTEGRATIONS: IntegrationName[] = [
  "supabase",
  "livekit",
  "onesignal",
  "resend",
  "sentry",
  "posthog",
  "openai",
  "paytoday",
  "mux",
  "mapbox",
  "cloudflare",
  "getstream",
  "knock",
  "cloudinary",
  "algolia",
];

export function isIntegrationAvailable(name: IntegrationName): boolean {
  return checkIntegrationStatus(name).enabled;
}

export function getIntegrationStatus(name: IntegrationName): IntegrationStatus {
  return checkIntegrationStatus(name);
}

export function getAllIntegrationStatuses(): IntegrationStatus[] {
  return ALL_INTEGRATIONS.map(checkIntegrationStatus);
}

export function getFeatureFlags(): FeatureFlags {
  return computeFeatureFlags();
}

export function logIntegrationDiagnostics(): void {
  if (typeof window === "undefined" || !import.meta.env.DEV) {
    return;
  }

  const statuses = getAllIntegrationStatuses();
  console.group(
    "%cMatisa Third-Party Integration Diagnostics",
    "color: #C8521A; font-weight: bold; font-size: 12px;",
  );

  statuses.forEach((s) => {
    const badge = s.enabled ? "✅ READY" : "⚠️ NOT CONFIGURED";
    const color = s.enabled ? "color: #00D9C0;" : "color: #E25822;";
    console.log(`%c[${s.displayName.padEnd(20)}] ${badge} - ${s.reason}`, color);
  });

  const flags = getFeatureFlags();
  console.log("%cActive Feature Flags:", "color: #FF7B00; font-weight: bold;", flags);
  console.groupEnd();
}
