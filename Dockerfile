FROM node:18-alpine as builder

WORKDIR /usr/app

COPY package*.json . .env ./
RUN yarn install

RUN yarn build

FROM node:18-alpine as runner

WORKDIR /usr/app

COPY --from=builder /usr/app/package*.json ./
COPY --from=builder /usr/app/dist ./dist
COPY --from=builder /usr/app/node_modules ./node_modules
COPY --from=builder /usr/app/prisma ./prisma
COPY --from=builder /usr/app/.env ./

CMD ["yarn", "start-dev"]
