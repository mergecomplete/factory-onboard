// pnpm seed: adds a few items to a running copy of the app, so the page has
// something to show. Each has a fixed id, and the API ignores an id it
// already has, so running it twice adds nothing.
//
//   pnpm seed                                  the local copy (wrangler on API_PORT, default 8787)
//   pnpm seed --url https://<staging host>     any deployed copy
//
// The store is in memory, so a restarted dev server (or a recycled Worker
// isolate) starts empty again: seed after `pnpm dev` comes up.

const ITEMS = [
  { id: "seed-1", title: "Write the welcome copy" },
  { id: "seed-2", title: "Check the form on a phone" },
  { id: "seed-3", title: "Ship it to staging" },
];

function baseUrl(args: string[]): string {
  const at = args.indexOf("--url");
  if (at !== -1) {
    const url = args[at + 1];
    if (!url) throw new Error("--url needs a value, such as https://example.workers.dev");
    return url.replace(/\/+$/, "");
  }
  return `http://localhost:${process.env.API_PORT ?? "8787"}`;
}

const base = baseUrl(process.argv.slice(2));
let added = 0;
for (const item of ITEMS) {
  const response = await fetch(`${base}/api/items`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!response.ok) {
    console.error(`Couldn't add "${item.title}" at ${base}: ${response.status} ${await response.text()}`);
    process.exit(1);
  }
  if (response.status === 201) added++;
}
console.log(`Seeded ${base}: ${added} added, ${ITEMS.length - added} already there.`);
