import { beforeEach, describe, expect, it } from "vitest";

import type { Item, Report } from "../src/shared";
import { createApp } from "../src/worker/app";
import { MemoryStore } from "../src/worker/store";

// A fresh app and store per test, so tests share nothing.
let app: ReturnType<typeof createApp>;
beforeEach(() => {
  app = createApp(new MemoryStore());
});

function post(body: unknown) {
  return app.request("/api/items", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/items", () => {
  it("starts empty", async () => {
    const response = await app.request("/api/items");
    expect(await response.json()).toEqual({ items: [] });
  });

  it("adds an item and lists it", async () => {
    const created = await post({ title: "  First  " });
    expect(created.status).toBe(201);
    const { item } = (await created.json()) as { item: Item };
    expect(item.title).toBe("First");

    const listed = (await (await app.request("/api/items")).json()) as { items: Item[] };
    expect(listed.items).toEqual([item]);
  });

  it("keeps the first item under a fixed id, as the seed relies on", async () => {
    expect((await post({ id: "seed-1", title: "One" })).status).toBe(201);
    const again = await post({ id: "seed-1", title: "Changed" });
    expect(again.status).toBe(200);
    expect(((await again.json()) as { item: Item }).item.title).toBe("One");
  });

  it.each([
    ["no body", null],
    ["an empty title", { title: "   " }],
    ["a title that's too long", { title: "x".repeat(201) }],
    ["an id that isn't a string", { title: "Fine", id: 7 }],
  ])("refuses %s", async (_name, body) => {
    const response = await post(body);
    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty("error");
  });
});

describe("/api/reports", () => {
  async function reports(query = "") {
    const response = await app.request(`/api/reports${query}`);
    return { status: response.status, body: (await response.json()) as { reports?: Report[] } };
  }

  it("lists every report, newest first", async () => {
    const { status, body } = await reports();
    expect(status).toBe(200);
    const dates = (body.reports ?? []).map((r) => r.createdAt);
    expect(dates.length).toBe(5);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("filters by type", async () => {
    const { body } = await reports("?type=sales");
    expect(body.reports?.map((r) => r.title)).toEqual(["Sales by region", "Sales by month"]);
    expect((await reports("?type=")).body.reports?.length).toBe(5);
  });

  it("refuses a type it doesn't know", async () => {
    const response = await app.request("/api/reports?type=marketing");
    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty("error");
  });
});

it("answers an unknown API path with a JSON 404", async () => {
  const response = await app.request("/api/nothing");
  expect(response.status).toBe(404);
});
