// pnpm dev: the Worker under wrangler and the page under Vite, together.
//
//   pnpm dev                              Vite on :5173, wrangler on :8787
//   PORT=6100 API_PORT=6101 pnpm dev      a second copy beside the first
//
// Vite proxies /api and /version to wrangler (vite.config.ts). wrangler's
// devtools inspector takes a port too, 9229 by default, so a second copy
// would collide on it; it's moved to API_PORT + 10000 to keep each copy's
// ports in its own block. Ctrl-C, or either process exiting, stops both.

import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";

const port = process.env.PORT ?? "5173";
const apiPort = process.env.API_PORT ?? "8787";
const inspectorPort = String(Number(apiPort) + 10000);

// wrangler refuses to start when assets.directory is missing.
mkdirSync("dist", { recursive: true });

const env = { ...process.env, PORT: port, API_PORT: apiPort, WRANGLER_SEND_METRICS: "false" };

const children = [
  spawn(
    "pnpm",
    [
      "exec",
      "wrangler",
      "dev",
      "--port",
      apiPort,
      "--inspector-port",
      inspectorPort,
      "--show-interactive-dev-session=false",
    ],
    { stdio: "inherit", env },
  ),
  spawn("pnpm", ["exec", "vite"], { stdio: "inherit", env }),
];

let stopping = false;
function stop(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (child.exitCode === null) child.kill("SIGTERM");
  process.exitCode = code;
}

for (const child of children) child.on("exit", (code) => stop(code ?? 1));
process.on("SIGINT", () => stop(130));
process.on("SIGTERM", () => stop(143));
