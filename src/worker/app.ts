import { Hono } from "hono";

import { type NewItem, REPORT_TYPES, TITLE_MAX } from "../shared";
import { filterReports, isReportType } from "./reports";
import type { MemoryStore } from "./store";

export type Env = {
  Bindings: {
    // "development", "staging" or "production", from wrangler.jsonc.
    ENVIRONMENT?: string;
    // The commit, set by the deploy with `--var VERSION:<sha>`. Unset locally.
    VERSION?: string;
  };
};

/**
 * The app's routes. The store is passed in so each test gets an empty one.
 * Everything else (the page and its assets) is served by wrangler's static
 * assets, which only hand /api/* and /version to this Worker.
 */
export function createApp(store: MemoryStore) {
  const app = new Hono<Env>();

  // The deployed commit. CI's deploy polls this until it shows the commit it
  // just deployed, and the factory's staging check reads the same field.
  app.get("/version", (c) =>
    c.json({ version: c.env?.VERSION || "dev", environment: c.env?.ENVIRONMENT ?? "development" }),
  );

  app.get("/api/items", (c) => c.json({ items: store.list() }));

  app.post("/api/items", async (c) => {
    const parsed = parseNewItem(await c.req.json().catch(() => null));
    if (typeof parsed === "string") return c.json({ error: parsed }, 400);
    const { item, created } = store.add(parsed);
    return c.json({ item }, created ? 201 : 200);
  });

  // The Reports page's list; ?type= filters it to one type.
  app.get("/api/reports", (c) => {
    const type = c.req.query("type");
    if (type === undefined || type === "") return c.json({ reports: filterReports() });
    if (!isReportType(type)) {
      return c.json({ error: `The type is one of ${REPORT_TYPES.join(", ")}.` }, 400);
    }
    return c.json({ reports: filterReports(type) });
  });

  app.notFound((c) => c.json({ error: "Not found" }, 404));

  return app;
}

/** The body as a NewItem, or the reason it isn't one. */
export function parseNewItem(body: unknown): NewItem | string {
  if (typeof body !== "object" || body === null) return "Send a JSON object with a title.";
  const { title, id } = body as Record<string, unknown>;
  if (typeof title !== "string" || title.trim() === "") return "The title can't be empty.";
  if (title.length > TITLE_MAX) return `The title can be at most ${TITLE_MAX} characters.`;
  if (id !== undefined && (typeof id !== "string" || id === "")) return "The id must be a string.";
  return id === undefined ? { title: title.trim() } : { title: title.trim(), id };
}
