FROM node:22-alpine
WORKDIR /app

COPY gateway/package*.json ./
RUN npm ci --omit=dev

COPY gateway/ ./gateway/
COPY shared/ ./shared/

WORKDIR /app/gateway
EXPOSE 8000
CMD ["node", "index.js"]