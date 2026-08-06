# Use Node 20 on Debian Bullseye (Debian 11) — NOT Bookworm/Alpine
# Bullseye ships OpenSSL 1.1 (libcrypto.so.1.1) required by @journeyapps/sqlcipher
FROM node:20-bullseye-slim

# Install build tools needed to compile @journeyapps/sqlcipher's bundled SQLCipher 4
# NOTE: Do NOT install libsqlcipher-dev — Bullseye's apt has SQLCipher 3.x which
# cannot open SQLCipher 4 databases. We let the npm package compile SQLCipher 4 itself.
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    tcl \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend package files first for layer caching
# (build context is repo root, so we reference backend/ explicitly)
COPY backend/package*.json ./

# Force @journeyapps/sqlcipher to compile its own bundled SQLCipher 4
# instead of linking against the system library
ENV npm_config_sqlcipher=bundled
RUN npm install

# Copy the backend source files into /app
COPY backend/ ./

EXPOSE 5000

CMD ["node", "server.js"]
