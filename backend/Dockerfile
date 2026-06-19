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

# Copy package files first for layer caching
COPY package*.json ./

# Install deps and rebuild native modules for Linux
RUN npm install && npm rebuild @journeyapps/sqlcipher --build-from-source

# Copy the rest of the backend source
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
