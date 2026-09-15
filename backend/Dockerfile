# ---------- Base ----------
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# ---------- Dependencies (with dev deps, for build) ----------
FROM base AS dependencies
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

# ---------- Build ----------
FROM dependencies AS build
COPY . .
RUN npm run build

# ---------- Production dependencies only ----------
FROM base AS prod-dependencies
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev
RUN npx prisma generate

# ---------- Runtime ----------
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=prod-dependencies /app/node_modules ./node_modules
COPY --from=prod-dependencies /app/prisma ./prisma
COPY --from=build /app/dist ./dist
COPY package*.json ./

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]