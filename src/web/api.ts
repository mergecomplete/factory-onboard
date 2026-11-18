import type { Item, NewItem, Report, ReportType } from "../shared";

// Relative paths: in development Vite proxies /api and /version to wrangler,
// and deployed the Worker serves both on the page's own origin.

export async function listItems(): Promise<Item[]> {
  const response = await fetch("/api/items");
  if (!response.ok) throw new Error(`Couldn't load the items (${response.status}).`);
  const body = (await response.json()) as { items: Item[] };
  return body.items;
}

export async function addItem(input: NewItem): Promise<Item> {
  const response = await fetch("/api/items", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = (await response.json()) as { item?: Item; error?: string };
  if (!response.ok || !body.item) throw new Error(body.error ?? `Couldn't add the item (${response.status}).`);
  return body.item;
}

export async function getVersion(): Promise<string> {
  const response = await fetch("/version");
  if (!response.ok) return "unknown";
  const body = (await response.json()) as { version: string };
  return body.version;
}

export async function listReports(type: ReportType | null): Promise<Report[]> {
  const response = await fetch(type ? `/api/reports?type=${type}` : "/api/reports");
  if (!response.ok) throw new Error(`Couldn't load the reports (${response.status}).`);
  const body = (await response.json()) as { reports: Report[] };
  return body.reports;
}
