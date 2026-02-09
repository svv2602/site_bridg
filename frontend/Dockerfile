# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Build-time args for Next.js public env vars
# Public URL must be accessible from browser, not internal Docker network
ARG NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3001
ENV NEXT_PUBLIC_PAYLOAD_URL=$NEXT_PUBLIC_PAYLOAD_URL

# Skip image optimization in Docker (localhost resolves to private IP)
ARG SKIP_IMAGE_OPTIMIZATION=true
ENV SKIP_IMAGE_OPTIMIZATION=$SKIP_IMAGE_OPTIMIZATION

# Analytics and external services (baked into JS bundle at build time)
ARG NEXT_PUBLIC_GA4_MEASUREMENT_ID=""
ARG NEXT_PUBLIC_META_PIXEL_ID=""
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
ENV NEXT_PUBLIC_GA4_MEASUREMENT_ID=$NEXT_PUBLIC_GA4_MEASUREMENT_ID
ENV NEXT_PUBLIC_META_PIXEL_ID=$NEXT_PUBLIC_META_PIXEL_ID
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3010

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3010

CMD ["node", "server.js"]
