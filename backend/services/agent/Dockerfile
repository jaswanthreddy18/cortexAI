FROM node:22-alpine
WORKDIR /app

COPY services/agent/package*.json ./
RUN npm ci --omit=dev

COPY services/agent/ ./services/agent/
COPY shared/ ./shared/

WORKDIR /app/services/agent
EXPOSE 8003
CMD ["node", "index.js"]