# sirtraver.com — container image for your own server.
# Build from the site/ folder:  docker build -f deploy/Dockerfile -t sirtraver .
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN node scripts/build.mjs

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4173 DATA_DIR=/data
# Only what the server needs at runtime: the bundle, the processed media and the server.
COPY --from=build /app/dist ./dist
COPY --from=build /app/public/media ./public/media
COPY --from=build /app/server ./server
COPY --from=build /app/package.json ./
VOLUME /data
EXPOSE 4173
USER node
CMD ["node", "server/node.mjs"]
