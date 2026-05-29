FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock tsconfig.base.json .yarnrc.yml ./
COPY packages ./packages
COPY apps/frontend ./apps/frontend

RUN corepack enable && corepack prepare yarn@stable --activate && npm install -g typescript@5.3 && yarn install && yarn workspace @production-orders/types build && yarn workspace @production-orders/frontend build

EXPOSE 3000

CMD ["node", "apps/frontend/.next/standalone/server.js"]
