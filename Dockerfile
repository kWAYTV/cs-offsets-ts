FROM oven/bun:1-alpine AS base

FROM base AS install
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

FROM base AS runner
WORKDIR /app
COPY --from=install /app/node_modules node_modules
COPY package.json ./
COPY config ./config
COPY src ./src

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["bun", "run", "src/serve.ts"]
