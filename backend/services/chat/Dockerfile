FROM node:22-alpine
WORKDIR /app

COPY services/chat/package*.json ./services/chat/
RUN cd services/chat && npm ci --omit=dev

COPY services/chat/ ./services/chat/

WORKDIR /app/services/chat
EXPOSE 8002
CMD ["node", "index.js"]