FROM node:lts-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci
COPY . .
RUN npm run build

FROM node:lts-alpine
WORKDIR /app
COPY package*.json ./
COPY .env .env

RUN npm ci --omit=dev

COPY --from=build /usr/src/app/dist /app

EXPOSE 8080
CMD [ "node", "server.js" ]