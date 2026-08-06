FROM node:20-bullseye-slim

# better-sqlite3 ships prebuilt binaries for Node 20 on Linux x64 —
# no build tools or SQLCipher libraries needed.
WORKDIR /app

# Copy backend package files first for layer caching
COPY backend/package*.json ./

RUN npm install

# Copy the backend source files (courier.db excluded via .dockerignore)
COPY backend/ ./

EXPOSE 5000

CMD ["node", "server.js"]
