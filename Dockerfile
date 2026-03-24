FROM node:22-bookworm-slim

WORKDIR /workspace

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

EXPOSE 3000

CMD ["bash", "-lc", "npm run dev -- --hostname 0.0.0.0"]
