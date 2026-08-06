# Use Node 20 on Debian Bullseye (Debian 11) — NOT Bookworm/Alpine
# Bullseye ships OpenSSL 1.1 (libcrypto.so.1.1) required by @journeyapps/sqlcipher
FROM node:20-bullseye-slim

# Install build tools + SQLCipher
# No courier.db is shipped — a fresh DB is created on startup by init()
# so there is no SQLCipher version mismatch between Windows and Linux.
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libsqlcipher-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend package files first for layer caching
# (build context is repo root, so we reference backend/ explicitly)
COPY backend/package*.json ./

# Install deps and rebuild native modules for Linux
RUN npm install

# Copy the backend source files into /app
# courier.db is excluded via .dockerignore — a fresh one is created on startup
COPY backend/ ./

EXPOSE 5000

CMD ["node", "server.js"]

