# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .

# Payload CMS requires PAYLOAD_SECRET (32+ chars) during next build
# This dummy value is only used at build time; real secret is injected at runtime
ENV PAYLOAD_SECRET="build-time-dummy-secret-not-used-in-production-32chars"
ENV DATABASE_URI="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npm run build
ENV PAYLOAD_SECRET=""
ENV DATABASE_URI=""

# Production stage
FROM node:20-slim AS runner

WORKDIR /app

# Install Python, curl (for healthcheck), and dependencies for rembg
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment and install rembg
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir "rembg[cpu,cli]" pillow

# Pre-download the U2-Net model (optional, ~170MB)
# This speeds up first image processing
RUN python3 -c "from rembg import new_session; new_session('u2net')"

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts

# Copy content-automation source (scheduler runs via npx tsx)
COPY --from=builder /app/content-automation ./content-automation

# Copy Payload source and config (required for Payload runtime)
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/payload.config.ts ./

# Create media directory
RUN mkdir -p media

ENV NODE_ENV=production
ENV PORT=3001
ENV REMBG_PATH=/opt/venv/bin/rembg

EXPOSE 3001

CMD ["npm", "start"]
