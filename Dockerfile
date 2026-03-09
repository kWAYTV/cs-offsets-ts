# https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.3-alpine AS base
WORKDIR /usr/src/app

# install deps in temp dir for layer caching
FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json bun.lock* /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy production node_modules and app
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY package.json ./
COPY config ./config
COPY src ./src

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000/tcp
USER bun
ENTRYPOINT ["bun", "run", "src/serve.ts"]
