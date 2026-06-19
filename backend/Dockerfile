# Use Node 20 on Debian Bullseye (Debian 11) — NOT Bookworm/Alpine
# Bullseye ships OpenSSL 1.1 (libcrypto.so.1.1) required by @journeyapps/sqlcipher
FROM node:20-bullseye-slim

# Install build tools + SQLCipher with OpenSSL 1.1 support
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
COPY backend/ ./

EXPOSE 5000

CMD ["node", "server.js"]
