import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";

interface ServiceCheck {
  status: string;
  latency_ms?: number;
  message?: string;
  error?: string;
}

interface HealthCheck {
  status: string;
  timestamp: string;
  version?: string;
  database?: ServiceCheck;
  storage?: ServiceCheck;
  stripe?: ServiceCheck;
}

const StatusDot = ({ status }: { status: string }) => {
  const color =
    status === "ok"
      ? "bg-success"
      : status === "not_configured"
      ? "bg-muted-foreground"
      : "bg-destructive";
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />;
};

const ServiceRow = ({
  label,
  check,
}: {
  label: string;
  check: ServiceCheck;
}) => (
  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
    <div className="flex items-center gap-3">
      <StatusDot status={check.status} />
      <span className="font-medium text-sm">{label}</span>
    </div>
    <span className="text-xs text-muted-foreground">
      {check.status === "not_configured"
        ? check.message ?? "not configured"
        : check.latency_ms != null
        ? `${check.latency_ms}ms`
        : check.status}
    </span>
  </div>
);

export default function Status() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const resp = await fetch(`${supabaseUrl}/functions/v1/health`);
        const data: HealthCheck = await resp.json();
        setHealth(data);
        setLastRefresh(new Date());
        setError(null);
      } catch (e: unknown) {
        setError((e as Error).message);
      }
    }
    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy = health?.status === "healthy";

  return (
    <>
      <SEO
        title="Status"
        description="Sandal service status — real-time health monitoring"
        noindex
      />
      <div className="max-w-2xl mx-auto px-6 py-10 font-cairo">
        <h1 className="text-3xl font-bold mb-1">Sandal Status</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Real-time service health · refreshes every 30 seconds
        </p>

        {/* Fetch error banner */}
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive mb-6">
            <p className="font-semibold text-sm">Could not reach status endpoint</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {!health && !error && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
            <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            Checking services…
          </div>
        )}

        {health && (
          <>
            {/* Overall banner */}
            <div
              className={`p-4 rounded-xl mb-6 border ${
                isHealthy
                  ? "bg-success/10 border-success"
                  : "bg-destructive/10 border-destructive"
              }`}
            >
              <p className="font-bold text-lg">
                {isHealthy ? "✓ All systems operational" : "⚠ Some services degraded"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Checked:{" "}
                {lastRefresh?.toLocaleString() ??
                  new Date(health.timestamp).toLocaleString()}
                {health.version !== "unknown" && ` · v${health.version}`}
              </p>
            </div>

            {/* Service rows */}
            <div className="space-y-2">
              {health.database && (
                <ServiceRow label="Database" check={health.database} />
              )}
              {health.storage && (
                <ServiceRow label="Storage" check={health.storage} />
              )}
              {health.stripe && (
                <ServiceRow label="Payments (Stripe)" check={health.stripe} />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
