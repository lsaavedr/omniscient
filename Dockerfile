FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock tsconfig.base.json tsconfig.json .yarnrc.yml ./
COPY packages/ ./packages/
COPY apps/backend/ ./apps/backend/
COPY apps/frontend/ ./apps/frontend/

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 3001

CMD ["yarn", "workspace", "@production-orders/backend", "start"]
