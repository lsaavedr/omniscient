FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock tsconfig.base.json .yarnrc.yml ./
COPY packages ./packages
COPY apps/backend ./apps/backend

RUN npm install -g typescript@5.3
RUN corepack enable && corepack prepare yarn@stable --activate && yarn install && yarn workspace @production-orders/types build && yarn workspace @production-orders/backend build

EXPOSE 3001

CMD ["node", "/app/apps/backend/dist/apps/backend/src/main.js"]
