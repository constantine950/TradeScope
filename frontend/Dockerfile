FROM node:20-alpine AS base
WORKDIR /app

FROM base AS dev
COPY package.json ./
RUN npm install
COPY . .

FROM base AS prod
COPY package.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]