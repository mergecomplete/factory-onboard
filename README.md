# Sample app

A tiny client app the factory's end-to-end checks run against: an items page
with a list and a form, a Reports page with a filter by type, an API on Hono,
and a Cloudflare Worker serving both. It
lives in the factory repo at `fixtures/sample-app/`, outside the factory's
pnpm workspace, and `scripts/push-fixture.sh` there pushes it to a scratch
repo (`skerra-test/factory-fixture`) as a fresh `master`.

## Run it

```sh
pnpm install
pnpm dev                              # Vite on :5173, wrangler on :8787
PORT=6100 API_PORT=6101 pnpm dev      # a second copy beside the first
pnpm seed                             # three items, into the copy on API_PORT
```

Vite proxies `/api` and `/version` to wrangler, so the page and the API share
one origin. The items live in memory: a restart empties them, and `pnpm seed`
puts the three back (it adds nothing that's already there).

## Routes

| Route | What it does |
|-------|--------------|
| `GET /api/items` | `{ items }`, oldest first |
| `POST /api/items` | `{ title, id? }` adds an item: `201`, or `200` with the existing item when the id is taken, or `400` with `{ error }` |
| `GET /api/reports?type=` | `{ reports }`, newest first; `type` (sales, usage or billing) filters them, and an unknown one is `400` |
| `GET /version` | `{ version, environment }`; `version` is the deployed commit, or `dev` locally |

## Check it

```sh
pnpm typecheck && pnpm test && pnpm build
```

CI (`.github/workflows/ci.yml`) runs the same on every pull request and push
to `master`, and `ci-ok` is the one check to require.

## Deploy it

`.github/workflows/deploy.yml` deploys staging after CI passes on a push to
`master`, and production when run by hand (`gh workflow run deploy.yml`,
with `-f sha=<full sha>` to pick a commit other than staging's). Both wait
until `/version` serves the commit. The workflow's header lists the secrets
and variables the repo needs.
