FROM node:20-alpine AS base
WORKDIR /app

FROM base AS dev
COPY package.json package-lock.json* ./
RUN npm install
COPY . .

FROM base AS prod
COPY package.json package-lock.json* ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]