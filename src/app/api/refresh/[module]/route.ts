import { NextResponse } from "next/server";
import { refreshModule } from "@/lib/pipeline/store";
import { MODULE_LIST } from "@/lib/pipeline/registry";

// Always run fresh — this endpoint IS the pipeline trigger.
export const dynamic = "force-dynamic";
// The forex scrape fetches a large WSS page; give it headroom (Hobby allows 60s).
export const maxDuration = 60;

/**
 * This endpoint hits RBI's servers, so it is NOT public. Vercel Cron sends
 * `Authorization: Bearer $CRON_SECRET` automatically when the env var is set;
 * we require it. Fails closed — if CRON_SECRET is unset, nobody gets in.
 */
function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

const UNAUTHORIZED = NextResponse.json(
  { ok: false, error: "Unauthorized — this endpoint requires CRON_SECRET." },
  { status: 401 },
);

async function handle(moduleKey: string) {
  if (moduleKey === "all") {
    const results = await Promise.all(
      MODULE_LIST.map(async (m) => {
        const r = await refreshModule(m.key);
        return { module: m.key, ok: r.ok, error: r.error, asOfDate: r.snapshot?.asOfDate };
      }),
    );
    const ok = results.every((r) => r.ok);
    return NextResponse.json({ ok, results }, { status: ok ? 200 : 502 });
  }

  const result = await refreshModule(moduleKey);
  return NextResponse.json(
    {
      ok: result.ok,
      module: moduleKey,
      error: result.error,
      snapshot: result.snapshot,
    },
    { status: result.ok ? 200 : 502 },
  );
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ module: string }> },
) {
  if (!isAuthorized(req)) return UNAUTHORIZED;
  const { module } = await ctx.params;
  return handle(module);
}

// GET is what Vercel Cron calls; same auth as POST — never open to the browser.
export async function GET(
  req: Request,
  ctx: { params: Promise<{ module: string }> },
) {
  if (!isAuthorized(req)) return UNAUTHORIZED;
  const { module } = await ctx.params;
  return handle(module);
}
