FROM node:lts-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci
COPY . .

FROM builder AS dev

EXPOSE 8080

CMD ["npm", "run", "serve"]

FROM builder AS prod

CMD ["npm", "run", "prod"]