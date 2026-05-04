FROM mcr.microsoft.com/playwright:v1.52.0-jammy

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src/ ./src/
COPY tsconfig.json ./

RUN npm install -g tsx

EXPOSE 3001

CMD ["tsx", "src/index.ts"]
