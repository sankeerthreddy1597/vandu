FROM mcr.microsoft.com/playwright:v1.59.1-jammy

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src/ ./src/
COPY tsconfig.json ./

RUN npm install -g tsx

EXPOSE 3001

CMD ["tsx", "src/index.ts"]
