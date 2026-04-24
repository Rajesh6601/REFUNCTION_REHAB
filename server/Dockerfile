FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source + prisma schema
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 4000

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
