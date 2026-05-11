FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Run as non-root user (security best practice)
USER node

EXPOSE 5000

CMD ["node", "src/server.js"]
