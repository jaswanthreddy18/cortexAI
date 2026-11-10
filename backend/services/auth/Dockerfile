FROM node:22-alpine
WORKDIR /app

COPY services/auth/package*.json ./
RUN npm ci --omit=dev

COPY services/auth/ ./services/auth/
COPY shared/ ./shared/

WORKDIR /app/services/auth
EXPOSE 8001
CMD ["node", "index.js"]