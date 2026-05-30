FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock tsconfig.base.json .yarnrc.yml ./
COPY packages ./packages
COPY apps/frontend ./apps/frontend

RUN npm install -g typescript@5.3
RUN corepack enable && corepack prepare yarn@stable --activate && yarn install && yarn workspace @production-orders/types build && yarn workspace @production-orders/frontend build

EXPOSE 3000

CMD ["yarn", "workspace", "@production-orders/frontend", "start"]
