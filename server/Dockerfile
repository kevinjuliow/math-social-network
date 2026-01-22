FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate && npx tsc --target ES2020 --skipLibCheck

EXPOSE 3000

CMD ["node", "dist/index.js"]