import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { clearDiagnostics, getSnapshot, subscribe, type DiagEntry } from "@/lib/diagnostics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ApiCheck = {
  name: string;
  status: "pending" | "ok" | "error";
  detail: string;
  ms?: number;
};

const kindTone: Record<DiagEntry["kind"], string> = {
  error: "bg-destructive/10 text-destructive",
  unhandledrejection: "bg-destructive/10 text-destructive",
  "console.error": "bg-muted text-muted-foreground",
  route: "bg-muted text-muted-foreground",
};

const Diagnostics = () => {
  const [snap, setSnap] = useState(getSnapshot());
  const [checks, setChecks] = useState<ApiCheck[]>([]);
  const [session, setSession] = useState<string>("checking…");

  useEffect(() => {
    const unsubscribe = subscribe(() => setSnap({ ...getSnapshot() }));
    return () => {
      unsubscribe();
    };
  }, []);

  const runChecks = async () => {
    const tasks: { name: string; run: () => Promise<string> }[] = [
      {
        name: "Database read (events)",
        run: async () => {
          const { count, error } = await supabase
            .from("events")
            .select("id", { count: "exact", head: true });
          if (error) throw error;
          return `${count ?? 0} rows visible`;
        },
      },
      {
        name: "Database read (experiences)",
        run: async () => {
          const { count, error } = await supabase
            .from("experiences")
            .select("id", { count: "exact", head: true });
          if (error) throw error;
          return `${count ?? 0} rows visible`;
        },
      },
      {
        name: "Auth session",
        run: async () => {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          return data.session ? `signed in as ${data.session.user.email ?? data.session.user.id}` : "signed out";
        },
      },
      {
        name: "Storage buckets",
        run: async () => {
          const { data, error } = await supabase.storage.from("post-photos").list("", { limit: 1 });
          if (error) throw error;
          return `reachable (${data?.length ?? 0} item sample)`;
        },
      },
    ];

    setChecks(tasks.map((t) => ({ name: t.name, status: "pending", detail: "running…" })));

    const results = await Promise.all(
      tasks.map(async (t): Promise<ApiCheck> => {
        const start = performance.now();
        try {
          const detail = await t.run();
          return { name: t.name, status: "ok", detail, ms: Math.round(performance.now() - start) };
        } catch (e) {
          return {
            name: t.name,
            status: "error",
            detail: e instanceof Error ? e.message : String(e),
            ms: Math.round(performance.now() - start),
          };
        }
      }),
    );
    setChecks(results);
  };

  useEffect(() => {
    runChecks();
    supabase.auth.getUser().then(({ data }) => setSession(data.user ? data.user.id : "anonymous"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const errors = snap.entries.filter((e) => e.kind !== "route");

  return (
    <div className="min-h-screen bg-background pb-24">
      <Helmet>
        <title>App Diagnostics | Sandaler</title>
        <meta name="description" content="Inspect the last loaded route, backend API status and captured frontend errors." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <header className="border-b border-border px-4 py-4">
        <h1 className="text-xl font-bold text-foreground">Diagnostics</h1>
        <p className="text-sm text-muted-foreground">Runtime health of this browser session.</p>
      </header>

      <main className="space-y-4 p-4">
        <Card className="p-4">
          <h2 className="mb-2 font-semibold text-foreground">Routes</h2>
          <p className="text-sm text-muted-foreground">
            Current: <span className="font-mono text-foreground">{snap.routes[0]?.path ?? "—"}</span>
          </p>
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {snap.routes.slice(1, 8).map((r) => (
              <li key={r.time} className="font-mono">
                {new Date(r.time).toLocaleTimeString()} · {r.path}
              </li>
            ))}
            {snap.routes.length <= 1 && <li>No previous routes recorded.</li>}
          </ul>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">API status</h2>
            <Button size="sm" variant="outline" onClick={runChecks}>
              Re-run
            </Button>
          </div>
          <ul className="space-y-2">
            {checks.map((c) => (
              <li key={c.name} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="text-foreground">{c.name}</p>
                  <p className="break-all text-xs text-muted-foreground">{c.detail}</p>
                </div>
                <Badge variant={c.status === "error" ? "destructive" : "secondary"}>
                  {c.status === "ok" ? `ok${c.ms != null ? ` · ${c.ms}ms` : ""}` : c.status}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">User: {session}</p>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Captured errors ({errors.length})</h2>
            <Button size="sm" variant="outline" onClick={clearDiagnostics}>
              Clear
            </Button>
          </div>
          {errors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No frontend errors captured in this session.</p>
          ) : (
            <ul className="space-y-3">
              {errors.map((e) => (
                <li key={e.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-xs ${kindTone[e.kind]}`}>{e.kind}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(e.time).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-2 break-all text-sm text-foreground">{e.message}</p>
                  {e.detail && (
                    <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all text-xs text-muted-foreground">
                      {e.detail}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4 text-xs text-muted-foreground">
          <p className="break-all">User agent: {navigator.userAgent}</p>
          <p>Viewport: {window.innerWidth}×{window.innerHeight}</p>
          <p>Language: {navigator.language}</p>
        </Card>

        <Link to="/" className="block text-center text-sm text-primary underline">
          Back to home
        </Link>
      </main>
    </div>
  );
};

export default Diagnostics;
