FROM node:22-bookworm-slim

WORKDIR /workspace

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

EXPOSE 3000

CMD ["bash", "-lc", "NODE_ENV=production npm run build && NODE_ENV=production npm run start -- --hostname 0.0.0.0"]
