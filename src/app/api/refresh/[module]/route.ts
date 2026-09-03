import { NextResponse } from "next/server";
import { refreshModule } from "@/lib/pipeline/store";
import { MODULE_LIST } from "@/lib/pipeline/registry";

// Always run fresh — this endpoint IS the pipeline trigger.
export const dynamic = "force-dynamic";

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
  _req: Request,
  ctx: { params: Promise<{ module: string }> },
) {
  const { module } = await ctx.params;
  return handle(module);
}

// GET allowed too, so you can trigger a refresh straight from the browser.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ module: string }> },
) {
  const { module } = await ctx.params;
  return handle(module);
}
