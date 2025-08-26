
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY .env .

RUN npm ci --only=production

COPY . .

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 && \
    chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 5000

CMD ["node", "server.js"]
