FROM node:22-alpine
WORKDIR /app
COPY mycases-api/package*.json ./
RUN npm install --omit=dev
COPY mycases-api/ ./
ENV NODE_ENV=production
CMD ["node", "server.js"]
