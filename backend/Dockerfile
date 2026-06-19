# Use Node 20 on Debian (NOT Alpine) — required for @journeyapps/sqlcipher native bindings
FROM node:20-bookworm-slim

# Install build tools needed to compile SQLCipher native addon
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libsqlcipher-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend package files first for layer caching
# (build context is repo root, so we reference backend/ explicitly)
COPY backend/package*.json ./

# Install deps and rebuild native modules for Linux
RUN npm install

# Copy the backend source files into /app
COPY backend/ ./

EXPOSE 5000

CMD ["node", "server.js"]
