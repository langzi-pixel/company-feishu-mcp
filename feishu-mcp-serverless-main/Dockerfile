FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci --ignore-scripts
COPY src ./src
COPY scripts ./scripts
COPY LICENSE THIRD_PARTY_NOTICES.md ./
RUN npm run build
FROM node:22-bookworm-slim
ENV NODE_ENV=production PORT=8080
WORKDIR /app
COPY --from=build /app/dist ./dist
USER node
EXPOSE 8080
CMD ["node", "dist/server.cjs"]
