# CS2 Offsets API

CS2 external ESP offsets for [CS2Go](https://www.unknowncheats.me/forum/counter-strike-2-releases/605464-cs2go-external-esp.html). Data sourced from [a2x/cs2-dumper](https://github.com/a2x/cs2-dumper).

## Prerequisites

- [Vercel CLI](https://vercel.com/docs/cli) — install via `npm i -g vercel`, `pnpm i -g vercel`, or `bun add -g vercel`

## Development

```bash
bun install
vc dev
```

API available at `http://localhost:3000`.

## Docker

```bash
docker run -p 3000:3000 ghcr.io/kwaytv/cs-offsets-ts:latest
```

Or with docker-compose: `docker compose up`.

## Endpoints

| Method | Path       | Description                          |
|--------|------------|--------------------------------------|
| GET    | `/`        | API info and endpoints               |
| GET    | `/offsets` | Flattened offsets (5min cache)       |
| GET    | `/doc`     | OpenAPI 3.0 JSON spec                |
| GET    | `/scalar`  | Scalar API reference UI              |
| GET    | `/llms.txt`| Markdown API docs (for LLMs)         |

## Deploy

```bash
vc deploy
vc deploy --prod
```
